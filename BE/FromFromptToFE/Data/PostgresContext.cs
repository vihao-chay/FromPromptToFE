using System;
using System.Collections.Generic;
using FromFromptToFE.Models;
using Microsoft.EntityFrameworkCore;

namespace FromFromptToFE.Data;

public partial class PostgresContext : DbContext
{
    public PostgresContext()
    {
    }

    public PostgresContext(DbContextOptions<PostgresContext> options)
        : base(options)
    {
    }

    public virtual DbSet<ApiSpec> ApiSpecs { get; set; }

    public virtual DbSet<ChangeLog> ChangeLogs { get; set; }

    public virtual DbSet<DesignSystem> DesignSystems { get; set; }

    public virtual DbSet<GenerateFile> GenerateFiles { get; set; }

    public virtual DbSet<GenerateTask> GenerateTasks { get; set; }

    public virtual DbSet<Organization> Organizations { get; set; }

    public virtual DbSet<OrganizationMember> OrganizationMembers { get; set; }

    public virtual DbSet<Page> Pages { get; set; }

    public virtual DbSet<ProjectInput> ProjectInputs { get; set; }

    public virtual DbSet<ProjectOutput> ProjectOutputs { get; set; }

    public virtual DbSet<Repository> Repositories { get; set; }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseNpgsql("Server=aws-1-ap-south-1.pooler.supabase.com;Database=postgres;User Id=postgres.wemxaapnnfbdwwvymzcl;Password=SWD392@Nhom6;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .HasPostgresEnum("auth", "aal_level", new[] { "aal1", "aal2", "aal3" })
            .HasPostgresEnum("auth", "code_challenge_method", new[] { "s256", "plain" })
            .HasPostgresEnum("auth", "factor_status", new[] { "unverified", "verified" })
            .HasPostgresEnum("auth", "factor_type", new[] { "totp", "webauthn", "phone" })
            .HasPostgresEnum("auth", "oauth_authorization_status", new[] { "pending", "approved", "denied", "expired" })
            .HasPostgresEnum("auth", "oauth_client_type", new[] { "public", "confidential" })
            .HasPostgresEnum("auth", "oauth_registration_type", new[] { "dynamic", "manual" })
            .HasPostgresEnum("auth", "oauth_response_type", new[] { "code" })
            .HasPostgresEnum("auth", "one_time_token_type", new[] { "confirmation_token", "reauthentication_token", "recovery_token", "email_change_token_new", "email_change_token_current", "phone_change_token" })
            .HasPostgresEnum("realtime", "action", new[] { "INSERT", "UPDATE", "DELETE", "TRUNCATE", "ERROR" })
            .HasPostgresEnum("realtime", "equality_op", new[] { "eq", "neq", "lt", "lte", "gt", "gte", "in" })
            .HasPostgresEnum("storage", "buckettype", new[] { "STANDARD", "ANALYTICS", "VECTOR" })
            .HasPostgresExtension("extensions", "pg_stat_statements")
            .HasPostgresExtension("extensions", "pgcrypto")
            .HasPostgresExtension("extensions", "uuid-ossp")
            .HasPostgresExtension("graphql", "pg_graphql")
            .HasPostgresExtension("vault", "supabase_vault");

        modelBuilder.Entity<ApiSpec>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("api_specs_pkey");

            entity.ToTable("api_specs");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.ProjectInputId).HasColumnName("project_input_id");
            entity.Property(e => e.SpecContent)
                .HasColumnType("json")
                .HasColumnName("spec_content");
            entity.Property(e => e.SpecType)
                .HasColumnType("character varying")
                .HasColumnName("spec_type");

            entity.HasOne(d => d.ProjectInput).WithMany(p => p.ApiSpecs)
                .HasForeignKey(d => d.ProjectInputId)
                .HasConstraintName("api_specs_project_input_id_fkey");
        });

        modelBuilder.Entity<ChangeLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("change_logs_pkey");

            entity.ToTable("change_logs");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Action)
                .HasColumnType("character varying")
                .HasColumnName("action");
            entity.Property(e => e.ActorId).HasColumnName("actor_id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.EntityId).HasColumnName("entity_id");
            entity.Property(e => e.EntityType)
                .HasColumnType("character varying")
                .HasColumnName("entity_type");
            entity.Property(e => e.OrganizationId).HasColumnName("organization_id");

            entity.HasOne(d => d.Actor).WithMany(p => p.ChangeLogs)
                .HasForeignKey(d => d.ActorId)
                .HasConstraintName("change_logs_actor_id_fkey");

            entity.HasOne(d => d.Organization).WithMany(p => p.ChangeLogs)
                .HasForeignKey(d => d.OrganizationId)
                .HasConstraintName("change_logs_organization_id_fkey");
        });

        modelBuilder.Entity<DesignSystem>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("design_systems_pkey");

            entity.ToTable("design_systems");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.Config)
                .HasColumnType("json")
                .HasColumnName("config");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.ProjectInputId).HasColumnName("project_input_id");

            entity.HasOne(d => d.ProjectInput).WithMany(p => p.DesignSystems)
                .HasForeignKey(d => d.ProjectInputId)
                .HasConstraintName("design_systems_project_input_id_fkey");
        });

        modelBuilder.Entity<GenerateFile>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("generate_files_pkey");

            entity.ToTable("generate_files");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.ContentHash)
                .HasColumnType("character varying")
                .HasColumnName("content_hash");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.FilePath)
                .HasColumnType("character varying")
                .HasColumnName("file_path");
            entity.Property(e => e.GenerateTaskId).HasColumnName("generate_task_id");
            entity.Property(e => e.Language)
                .HasColumnType("character varying")
                .HasColumnName("language");
            entity.Property(e => e.PageId).HasColumnName("page_id");
            entity.Property(e => e.RepositoryId).HasColumnName("repository_id");

            entity.HasOne(d => d.GenerateTask).WithMany(p => p.GenerateFiles)
                .HasForeignKey(d => d.GenerateTaskId)
                .HasConstraintName("generate_files_generate_task_id_fkey");

            entity.HasOne(d => d.Page).WithMany(p => p.GenerateFiles)
                .HasForeignKey(d => d.PageId)
                .HasConstraintName("generate_files_page_id_fkey");

            entity.HasOne(d => d.Repository).WithMany(p => p.GenerateFiles)
                .HasForeignKey(d => d.RepositoryId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("generate_files_repository_id_fkey");
        });

        modelBuilder.Entity<GenerateTask>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("generate_tasks_pkey");

            entity.ToTable("generate_tasks");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.ProjectOutputId).HasColumnName("project_output_id");
            entity.Property(e => e.Status)
                .HasColumnType("character varying")
                .HasColumnName("status");
            entity.Property(e => e.TaskType)
                .HasColumnType("character varying")
                .HasColumnName("task_type");
            entity.Property(e => e.ValidationResult)
                .HasColumnType("json")
                .HasColumnName("validation_result");

            entity.HasOne(d => d.ProjectOutput).WithMany(p => p.GenerateTasks)
                .HasForeignKey(d => d.ProjectOutputId)
                .HasConstraintName("generate_tasks_project_output_id_fkey");
        });

        modelBuilder.Entity<Organization>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("organizations_pkey");

            entity.ToTable("organizations");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.Plan)
                .HasDefaultValueSql("'free'::character varying")
                .HasColumnType("character varying")
                .HasColumnName("plan");
        });

        modelBuilder.Entity<OrganizationMember>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("organization_members_pkey");

            entity.ToTable("organization_members");

            entity.HasIndex(e => new { e.OrganizationId, e.UserId }, "organization_members_organization_id_user_id_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.OrganizationId).HasColumnName("organization_id");
            entity.Property(e => e.Role)
                .HasColumnType("character varying")
                .HasColumnName("role");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.Organization).WithMany(p => p.OrganizationMembers)
                .HasForeignKey(d => d.OrganizationId)
                .HasConstraintName("organization_members_organization_id_fkey");

            entity.HasOne(d => d.User).WithMany(p => p.OrganizationMembers)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("organization_members_user_id_fkey");
        });

        modelBuilder.Entity<Page>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("pages_pkey");

            entity.ToTable("pages");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.EntityName)
                .HasColumnType("character varying")
                .HasColumnName("entity_name");
            entity.Property(e => e.PageType)
                .HasColumnType("character varying")
                .HasColumnName("page_type");
            entity.Property(e => e.ProjectOutputId).HasColumnName("project_output_id");
            entity.Property(e => e.RepositoryId).HasColumnName("repository_id");
            entity.Property(e => e.Route)
                .HasColumnType("character varying")
                .HasColumnName("route");

            entity.HasOne(d => d.ProjectOutput).WithMany(p => p.Pages)
                .HasForeignKey(d => d.ProjectOutputId)
                .HasConstraintName("pages_project_output_id_fkey");

            entity.HasOne(d => d.Repository).WithMany(p => p.Pages)
                .HasForeignKey(d => d.RepositoryId)
                .HasConstraintName("pages_repository_id_fkey");
        });

        modelBuilder.Entity<ProjectInput>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("project_inputs_pkey");

            entity.ToTable("project_inputs");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.EntitySchema)
                .HasColumnType("json")
                .HasColumnName("entity_schema");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.OrganizationId).HasColumnName("organization_id");
            entity.Property(e => e.ProjectType)
                .HasColumnType("character varying")
                .HasColumnName("project_type");
            entity.Property(e => e.SystemPrompt).HasColumnName("system_prompt");

            entity.HasOne(d => d.Organization).WithMany(p => p.ProjectInputs)
                .HasForeignKey(d => d.OrganizationId)
                .HasConstraintName("project_inputs_organization_id_fkey");
        });

        modelBuilder.Entity<ProjectOutput>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("project_outputs_pkey");

            entity.ToTable("project_outputs");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.ProjectInputId).HasColumnName("project_input_id");
            entity.Property(e => e.Status)
                .HasColumnType("character varying")
                .HasColumnName("status");
            entity.Property(e => e.TriggeredBy).HasColumnName("triggered_by");
            entity.Property(e => e.Version)
                .HasColumnType("character varying")
                .HasColumnName("version");

            entity.HasOne(d => d.ProjectInput).WithMany(p => p.ProjectOutputs)
                .HasForeignKey(d => d.ProjectInputId)
                .HasConstraintName("project_outputs_project_input_id_fkey");

            entity.HasOne(d => d.TriggeredByNavigation).WithMany(p => p.ProjectOutputs)
                .HasForeignKey(d => d.TriggeredBy)
                .HasConstraintName("project_outputs_triggered_by_fkey");
        });

        modelBuilder.Entity<Repository>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("repositories_pkey");

            entity.ToTable("repositories");

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.FrontendFramework)
                .HasColumnType("character varying")
                .HasColumnName("frontend_framework");
            entity.Property(e => e.GitUrl)
                .HasColumnType("character varying")
                .HasColumnName("git_url");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.ProjectInputId).HasColumnName("project_input_id");

            entity.HasOne(d => d.ProjectInput).WithMany(p => p.Repositories)
                .HasForeignKey(d => d.ProjectInputId)
                .HasConstraintName("repositories_project_input_id_fkey");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("users_pkey");

            entity.ToTable("users");

            entity.HasIndex(e => e.Email, "users_email_key").IsUnique();

            entity.HasIndex(e => e.GoogleId, "users_google_id_key").IsUnique();

            entity.Property(e => e.Id)
                .HasDefaultValueSql("gen_random_uuid()")
                .HasColumnName("id");
            entity.Property(e => e.AvatarUrl)
                .HasColumnType("character varying")
                .HasColumnName("avatar_url");
            entity.Property(e => e.CreatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("created_at");
            entity.Property(e => e.Email)
                .HasColumnType("character varying")
                .HasColumnName("email");
            entity.Property(e => e.GoogleId)
                .HasColumnType("character varying")
                .HasColumnName("google_id");
            entity.Property(e => e.IsVerified)
                .HasDefaultValue(false)
                .HasColumnName("is_verified");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.PasswordHash)
                .HasColumnType("character varying")
                .HasColumnName("password_hash");
            entity.Property(e => e.Provider)
                .HasDefaultValueSql("'local'::character varying")
                .HasColumnType("character varying")
                .HasColumnName("provider");
            entity.Property(e => e.UpdatedAt)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("updated_at");
            entity.Property(e => e.VerifyToken)
                .HasColumnType("character varying")
                .HasColumnName("verify_token");
            entity.Property(e => e.ResetToken)
                .HasColumnType("character varying")
                .HasColumnName("reset_token");
            entity.Property(e => e.ResetTokenExpires)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("reset_token_expires");
            entity.Property(e => e.RefreshToken)
                .HasColumnType("character varying")
                .HasColumnName("refresh_token");
            entity.Property(e => e.RefreshTokenExpires)
                .HasColumnType("timestamp without time zone")
                .HasColumnName("refresh_token_expires");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
