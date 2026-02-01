
using AutoMapper;
using FromFromptToFE.DTOs.Auth;
using FromFromptToFE.DTOs;
using FromFromptToFE.Enums;
using FromFromptToFE.Models;

namespace FromFromptToFE.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<RegisterDto, User>()
                .ForMember(dest => dest.Provider, opt => opt.MapFrom(src => "local"))
                .ForMember(dest => dest.IsVerified, opt => opt.MapFrom(src => false));

            CreateMap<User, AuthResponseDto>();

            CreateMap<User, UserDto>();

            CreateMap<Organization, OrganizationDto>();
            CreateMap<CreateOrganizationDto, Organization>();
            CreateMap<UpdateOrganizationDto, Organization>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<OrganizationMember, OrganizationMemberDto>()
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src => src.User.Name))
                .ForMember(dest => dest.UserEmail, opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.UserAvatar, opt => opt.MapFrom(src => src.User.AvatarUrl))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => Enum.Parse<OrganizationRole>(src.Role)));

            CreateMap<AddMemberDto, OrganizationMember>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));

            CreateMap<OrganizationMember, UserOrganizationDto>()
                .ForMember(dest => dest.OrganizationName, opt => opt.MapFrom(src => src.Organization.Name))
                .ForMember(dest => dest.OrganizationPlan, opt => opt.MapFrom(src => src.Organization.Plan))
                .ForMember(dest => dest.JoinedAt, opt => opt.MapFrom(src => src.CreatedAt));
        }
    }
}
