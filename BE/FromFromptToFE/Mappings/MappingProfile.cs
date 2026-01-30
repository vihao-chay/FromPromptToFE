
using AutoMapper;
using FromFromptToFE.DTOs.Auth;
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

            CreateMap<User, AuthResponseDto>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => src.Name ?? src.Email));
        }
    }
}
