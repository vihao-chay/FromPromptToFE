using AutoMapper;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories;
using FromFromptToFE.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FromFromptToFE.Services
{
    public class OrganizationMemberService : IOrganizationMemberService
    {
        private readonly IOrganizationMemberRepository _repository;
        private readonly IUserRepository _userRepository;
        private readonly IOrganizationRepository _organizationRepository;
        private readonly IEmailService _emailService;
        private readonly IMapper _mapper;

        private readonly IConfiguration _configuration;

        public OrganizationMemberService(
            IOrganizationMemberRepository repository, 
            IUserRepository userRepository,
            IOrganizationRepository organizationRepository,
            IEmailService emailService,
            IMapper mapper,
            IConfiguration configuration)
        {
            _repository = repository;
            _userRepository = userRepository;
            _organizationRepository = organizationRepository;
            _emailService = emailService;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<PagingResult<OrganizationMemberDto>> GetMembersByOrgIdAsync(Guid organizationId, MemberFilterDto filter)
        {
            var (items, totalCount) = await _repository.GetPagedMembersAsync(
                organizationId,
                filter.Search,
                filter.PageIndex,
                filter.PageSize);

            return new PagingResult<OrganizationMemberDto>
            {
                TotalItems = _mapper.Map<List<OrganizationMemberDto>>(items),
                TotalRow = totalCount,
                PageIndex = filter.PageIndex,
                PageSize = filter.PageSize
            };
        }

        public async Task<OrganizationMemberDto> AddMemberAsync(AddMemberDto addDto)
        {
            var member = _mapper.Map<OrganizationMember>(addDto);
            member.Id = Guid.NewGuid();
            member.CreatedAt = DateTime.UtcNow;

            await _repository.AddAsync(member);
            
            // Re-fetch to get User details for the DTO
            var addedMember = await _repository.GetPagedMembersAsync(member.OrganizationId, member.UserId.ToString(), 1, 1);
            return _mapper.Map<OrganizationMemberDto>(addedMember.Items.FirstOrDefault());
        }

        public async Task<OrganizationMemberDto> InviteMemberAsync(InviteMemberDto inviteDto)
        {
            // 1. Kiểm tra User tồn tại
            var user = await _userRepository.GetByEmailAsync(inviteDto.Email);
            if (user == null)
            {
                throw new KeyNotFoundException($"Không tìm thấy người dùng với email {inviteDto.Email}");
            }

            // 2. Lấy thông tin tổ chức để gửi mail
            var org = await _organizationRepository.GetByIdAsync(inviteDto.OrganizationId);
            if (org == null)
            {
                throw new KeyNotFoundException("Không tìm thấy tổ chức");
            }

            // 3. Kiểm tra xem user này đã trong tổ chức chưa (hoặc đang có lời mời chờ)
            var existingMember = await _repository.FindAsync(m => m.OrganizationId == inviteDto.OrganizationId && m.UserId == user.Id);
            if (existingMember != null)
            {
                if (existingMember.Status == "Joined" || string.IsNullOrEmpty(existingMember.Status))
                    throw new InvalidOperationException($"Người dùng {inviteDto.Email} đã là thành viên của tổ chức");
                if (existingMember.Status == "Invite")
                    throw new InvalidOperationException("Đã gửi lời mời, đang chờ phản hồi.");
            }

            // 4. Add Member với trạng thái Invite và token
            var inviteToken = Guid.NewGuid().ToString("N");
            var member = new OrganizationMember
            {
                Id = Guid.NewGuid(),
                OrganizationId = inviteDto.OrganizationId,
                UserId = user.Id,
                Role = inviteDto.Role.ToString(),
                Status = "Invite",
                InviteToken = inviteToken,
                CreatedAt = DateTime.UtcNow
            };
            await _repository.AddAsync(member);

            // 5. Link cho email: frontend sẽ gọi API join/reject với token
            var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:3000";
            var joinLink = $"{frontendUrl}/join-organization?token={inviteToken}";
            var rejectLink = $"{frontendUrl}/reject-organization?token={inviteToken}";

            try
            {
                await _emailService.SendOrganizationInviteEmailAsync(
                    user.Email,
                    string.IsNullOrEmpty(user.Name) ? "Bạn" : user.Name,
                    org.Name,
                    inviteDto.Role.ToString(),
                    joinLink,
                    rejectLink);
            }
            catch (Exception ex)
            {
                // Log lỗi gửi mail nhưng vẫn trả về ok vì add member đã xong
                Console.WriteLine($"[ERROR] Gửi email mời thất bại cho {inviteDto.Email}: {ex.Message}");
            }

            // 6. Return DTO
            var addedMember = await _repository.GetPagedMembersAsync(member.OrganizationId, member.UserId.ToString(), 1, 1);
            return _mapper.Map<OrganizationMemberDto>(addedMember.Items.FirstOrDefault());
        }

        public async Task<bool> AcceptInviteByTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return false;
            var member = await _repository.FindByInviteTokenAsync(token);
            if (member == null || member.Status != "Invite") return false;
            member.Status = "Joined";
            member.InviteToken = null;
            await _repository.UpdateAsync(member);
            return true;
        }

        public async Task<bool> RejectInviteByTokenAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return false;
            var member = await _repository.FindByInviteTokenAsync(token);
            if (member == null) return false;
            await _repository.DeleteAsync(member);
            return true;
        }

        public async Task<bool> UpdateMemberRoleAsync(Guid memberId, UpdateMemberRoleDto updateDto)
        {
            var member = await _repository.GetByIdAsync(memberId);
            if (member == null) return false;

            member.Role = updateDto.Role.ToString();
            await _repository.UpdateAsync(member);
            return true;
        }

        public async Task<bool> RemoveMemberAsync(Guid memberId)
        {
            var member = await _repository.GetByIdAsync(memberId);
            if (member == null) return false;

            await _repository.DeleteAsync(member);
            return true;
        }

        public async Task<IEnumerable<UserOrganizationDto>> GetOrganizationsByUserIdAsync(Guid userId)
        {
            var memberships = await _repository.GetByUserIdAsync(userId);
            return _mapper.Map<IEnumerable<UserOrganizationDto>>(memberships);
        }
    }
}
