using FromFromptToFE.Data;
using FromFromptToFE.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FromFromptToFE.Repositories
{
    public class OrganizationMemberRepository : Repository<OrganizationMember>, IOrganizationMemberRepository
    {
        public OrganizationMemberRepository(PostgresContext context) : base(context)
        {
        }

        public async Task<(IEnumerable<OrganizationMember> Items, int TotalCount)> GetPagedMembersAsync(Guid organizationId, string? search, int pageIndex, int pageSize)
        {
            var query = _dbSet.AsNoTracking()
                .Include(om => om.User)
                .Where(om => om.OrganizationId == organizationId)
                .AsQueryable();

            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(om => 
                    om.User.Name.Contains(search) || 
                    om.User.Email.Contains(search) || 
                    om.Role.Contains(search));
            }

            var totalCount = await query.CountAsync();
            var items = await query.Skip((pageIndex - 1) * pageSize)
                                   .Take(pageSize)
                                   .ToListAsync();

            return (items, totalCount);
        }

        public async Task<IEnumerable<OrganizationMember>> GetByUserIdAsync(Guid userId)
        {
            return await _dbSet.AsNoTracking()
                .Include(om => om.Organization)
                .Where(om => om.UserId == userId)
                .ToListAsync();
        }
    }
}
