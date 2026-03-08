
using AutoMapper;
using FromFromptToFE.DTOs.Auth;
using FromFromptToFE.DTOs;
using FromFromptToFE.Enums;
using FromFromptToFE.Models;
using System.Text.Json;

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
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => Enum.Parse<OrganizationRole>(src.Role)))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status ?? "Joined"));

            CreateMap<AddMemberDto, OrganizationMember>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));

            CreateMap<OrganizationMember, UserOrganizationDto>()
                .ForMember(dest => dest.OrganizationName, opt => opt.MapFrom(src => src.Organization.Name))
                .ForMember(dest => dest.OrganizationPlan, opt => opt.MapFrom(src => src.Organization.Plan))
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role))
                .ForMember(dest => dest.JoinedAt, opt => opt.MapFrom(src => src.CreatedAt));

            // Project mappings: EntitySchema in DB may be JSON or plain text (DBML) – only parse when valid JSON
            CreateMap<Project, ProjectDto>()
                .ForMember(dest => dest.EntitySchema, opt => opt.Ignore())
                .AfterMap((src, dest) =>
                {
                    if (string.IsNullOrEmpty(src.EntitySchema)) return;
                    try
                    {
                        var trimmed = src.EntitySchema.Trim();
                        if ((trimmed.StartsWith("{") && trimmed.EndsWith("}")) || (trimmed.StartsWith("[") && trimmed.EndsWith("]")))
                            dest.EntitySchema = JsonDocument.Parse(src.EntitySchema).RootElement;
                    }
                    catch { /* leave EntitySchema null when not valid JSON */ }
                });

            CreateMap<CreateProjectDto, Project>();

            CreateMap<UpdateProjectDto, Project>()
                .ForMember(dest => dest.EntitySchema, opt => opt.Ignore())
                .AfterMap((src, dest) =>
                {
                    if (src.EntitySchema.HasValue)
                    {
                        dest.EntitySchema = src.EntitySchema.Value.GetRawText();
                    }
                })
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // ApiSpec mappings
            CreateMap<ApiSpec, ApiSpecDto>()
                .ForMember(dest => dest.SpecContent, opt => opt.Ignore())
                .AfterMap((src, dest) =>
                {
                    if (src.SpecContent != null)
                    {
                        dest.SpecContent = JsonDocument.Parse(src.SpecContent).RootElement;
                    }
                });

            CreateMap<CreateApiSpecDto, ApiSpec>()
                .ForMember(dest => dest.SpecContent, opt => opt.Ignore())
                .AfterMap((src, dest) =>
                {
                    if (src.SpecContent.HasValue)
                    {
                        dest.SpecContent = src.SpecContent.Value.GetRawText();
                    }
                });

            CreateMap<UpdateApiSpecDto, ApiSpec>()
                .ForMember(dest => dest.SpecContent, opt => opt.Ignore())
                .AfterMap((src, dest) =>
                {
                    if (src.SpecContent.HasValue)
                    {
                        dest.SpecContent = src.SpecContent.Value.GetRawText();
                    }
                })
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
            CreateMap<ChangeLog, ChangeLogDto>();
            CreateMap<CreateChangeLogDto, ChangeLog>();

            CreateMap<Code, CodeDto>();
        }
    }
}
