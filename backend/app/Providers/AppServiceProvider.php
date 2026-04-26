<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            return config('app.frontend_url')."/password-reset/$token?email={$notifiable->getEmailForPasswordReset()}";
        });

        RateLimiter::for('auth', function (Request $request) {
            $email = (string) $request->input('email', 'guest');

            return Limit::perMinute(5)->by($email.'|'.$request->ip());
        });

        RateLimiter::for('public-seo', fn (Request $request) => [
            Limit::perMinute(60)->by($request->ip()),
        ]);

        RateLimiter::for('search', fn (Request $request) => [
            Limit::perMinute(30)->by(($request->user()?->id ?? 'guest').'|'.$request->ip()),
        ]);

        RateLimiter::for('feedback', fn (Request $request) => [
            Limit::perMinute(10)->by(($request->user()?->id ?? 'guest').'|'.$request->ip()),
        ]);

        RateLimiter::for('reports', fn (Request $request) => [
            Limit::perMinute(20)->by(($request->user()?->id ?? 'guest').'|'.$request->ip()),
        ]);

        RateLimiter::for('api', fn (Request $request) => [
            Limit::perMinute(120)->by($request->user()?->id ?? $request->ip()),
        ]);

        RateLimiter::for('admin-api', fn (Request $request) => [
            Limit::perMinute(180)->by($request->user()?->id ?? $request->ip()),
        ]);
    }
}
