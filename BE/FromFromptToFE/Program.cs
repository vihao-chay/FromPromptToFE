
using FromFromptToFE.Data;
using FromFromptToFE.Models;
using FromFromptToFE.Repositories;
using FromFromptToFE.Services;
using FromFromptToFE.Helpers;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Text.Json.Serialization;
using FromFromptToFE.Repositories.Interfaces;
using FromFromptToFE.Services.Interfaces;
using Microsoft.AspNetCore.HttpOverrides;

// Configure Npgsql to handle UTC timestamps with 'timestamp without time zone'
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// CORS
var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>() ?? new string[] { "http://localhost:3000" };
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.SetIsOriginAllowed(origin => true) // Allow any origin
                   .AllowAnyHeader()
                   .AllowAnyMethod()
                   .AllowCredentials(); 
        });
});
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "FromPromptToFE API", Version = "v1" });
    c.SchemaFilter<FromFromptToFE.Swagger.SortSchemaFilter>();
    c.OperationFilter<FromFromptToFE.Swagger.SortParameterOperationFilter>();
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\"",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Database
builder.Services.AddDbContext<PostgresContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("ConnectionString")));

// JWT Authentication (fallback key if appsettings.json has no Jwt:SecretKey)
var jwtSecret = builder.Configuration["Jwt:SecretKey"];
if (string.IsNullOrWhiteSpace(jwtSecret))
    jwtSecret = "FromPromptToFE-Dev-Jwt-SecretKey-Min32CharsRequired!!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "FromPromptToFE";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "FromPromptToFE";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
            NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier,
            RoleClaimType = System.Security.Claims.ClaimTypes.Role
        };
        options.Events = new JwtBearerEvents
        {
            OnChallenge = context =>
            {
                context.HandleResponse();
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";
                var message = string.IsNullOrEmpty(context.Error) ? "Unauthorized" : context.Error;
                if (!string.IsNullOrEmpty(context.ErrorDescription)) message += "; " + context.ErrorDescription;
                var body = System.Text.Json.JsonSerializer.Serialize(new { success = false, message, statusCode = 401 });
                return context.Response.WriteAsync(body);
            }
        };
    });

// Services
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IOrganizationRepository, OrganizationRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IOrganizationService, OrganizationService>();
builder.Services.AddScoped<IJwtAuthService, JwtService>();
builder.Services.AddScoped<IOrganizationMemberRepository, OrganizationMemberRepository>();
builder.Services.AddScoped<IOrganizationMemberService, OrganizationMemberService>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ICodeRepository, CodeRepository>();
builder.Services.AddScoped<ICodeService, CodeService>();
builder.Services.AddScoped<IApiSpecRepository, ApiSpecRepository>();
builder.Services.AddScoped<IApiSpecService, ApiSpecService>();
builder.Services.AddScoped<IChangeLogRepository, ChangeLogRepository>();
builder.Services.AddScoped<IChangeLogService, ChangeLogService>();

builder.Services.AddScoped<IAdminService, AdminService>();

builder.Services.AddHttpClient();
builder.Services.AddScoped<ICodeGenService, CodeGenService>();

// New ProjectOutput & Page Services
builder.Services.AddScoped<IProjectOutputRepository, ProjectOutputRepository>();
builder.Services.AddScoped<IProjectOutputService, ProjectOutputService>();
builder.Services.AddScoped<IGitHubPushService, GitHubPushService>();
builder.Services.AddScoped<IPageRepository, PageRepository>();
builder.Services.AddScoped<IPageService, PageService>();


// Email Service
builder.Services.Configure<FromFromptToFE.Models.EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

var app = builder.Build();

// Configure the HTTP request pipeline.
// Always enable Swagger for testing deployment (Can be restricted later for security)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "FromPromptToFE API V1");
    // Somee often hosts apps in subdirectories or has routing quirks
    c.RoutePrefix = "swagger"; 
});

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

app.UseHttpsRedirection();

app.UseCors("AllowReactApp");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
