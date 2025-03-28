var builder = WebApplication.CreateBuilder(args);

 
// Add services to the container.
builder.Services.AddHttpClient("ApiClient", client =>
{
    var bareUrl = builder.Configuration["ApiSettings:BaseUrl"];
    client.BaseAddress = new Uri(bareUrl ?? throw new InvalidOperationException("API base URL not configured"));

}).ConfigurePrimaryHttpMessageHandler(() => new HttpClientHandler
{
    ServerCertificateCustomValidationCallback = (msg, cert, chain, errors) => true,
    SslProtocols = System.Security.Authentication.SslProtocols.Tls12 |
                   System.Security.Authentication.SslProtocols.Tls13
}); 

builder.Services.AddControllersWithViews();

var app = builder.Build();

app.UseCors("AllowWeb");

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseRouting();

app.UseAuthorization();
app.MapStaticAssets();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}")
    .WithStaticAssets();


app.Run();
