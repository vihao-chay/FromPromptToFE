using AutoMapper;
using FromFromptToFE.Base;
using FromFromptToFE.DTOs;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories;
using FromFromptToFE.Services.Interfaces;
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

        public OrganizationMemberService(
            IOrganizationMemberRepository repository, 
            IUserRepository userRepository,
            IOrganizationRepository organizationRepository,
            IEmailService emailService,
            IMapper mapper)
        {
            _repository = repository;
            _userRepository = userRepository;
            _organizationRepository = organizationRepository;
            _emailService = emailService;
            _mapper = mapper;
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

            // 3. Kiểm tra xem user này đã trong tổ chức chưa
            var existingMember = await _repository.FindAsync(m => m.OrganizationId == inviteDto.OrganizationId && m.UserId == user.Id);
            if (existingMember != null)
            {
                throw new InvalidOperationException($"Người dùng {inviteDto.Email} đã là thành viên của tổ chức");
            }

            // 4. Add Member
            var member = new OrganizationMember
            {
                Id = Guid.NewGuid(),
                OrganizationId = inviteDto.OrganizationId,
                UserId = user.Id,
                Role = inviteDto.Role.ToString(),
                CreatedAt = DateTime.UtcNow
            };
            
            await _repository.AddAsync(member);

            // 5. Gửi email thông báo
            // Ở đây vì hàm chạy bất đồng bộ và có catch lỗi bên trong, ta chỉ gọi mà không chặn flow chính nếu mail lỗi (tùy vào design)
            // Hiện tại EmailService throw lỗi nếu send fail, có thể bọc try catch để không hỏng quá trình add
            try
            {
                await _emailService.SendOrganizationInviteEmailAsync(
                    user.Email, 
                    string.IsNullOrEmpty(user.Name) ? "Bạn" : user.Name, 
                    org.Name, 
                    inviteDto.Role.ToString());
            }
            catch (Exception)
            {
                // Ghi log lỗi gửi mail nhưng vẫn trả về ok vì add member đã xong
                // Logger could be injected here
            }

            // 6. Return DTO
            var addedMember = await _repository.GetPagedMembersAsync(member.OrganizationId, member.UserId.ToString(), 1, 1);
            return _mapper.Map<OrganizationMemberDto>(addedMember.Items.FirstOrDefault());
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
