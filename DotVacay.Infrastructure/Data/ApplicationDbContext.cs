using DotVacay.Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DotVacay.Infrastructure.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<ApplicationUser>(options)
{
    public DbSet<Trip> Trips { get; set; }
    public DbSet<PointOfInterest> PointsOfInterest { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserTrip>()
            .HasKey(ut => new { ut.UserId, ut.TripId });

        modelBuilder.Entity<UserTrip>()
            .HasOne(ut => ut.User)
            .WithMany(u => u.UserTrips)
            .HasForeignKey(ut => ut.UserId);

        modelBuilder.Entity<UserTrip>()
            .HasOne(ut => ut.Trip)
            .WithMany(t => t.UserTrips)
            .HasForeignKey(ut => ut.TripId);

        modelBuilder.Entity<PointOfInterest>()
            .HasOne(p => p.Trip)
            .WithMany(t => t.PointsOfInterest)
            .HasForeignKey(p => p.TripId);
    }


}


