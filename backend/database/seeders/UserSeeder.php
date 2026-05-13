<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create our permanent Admin test account
        $admin = User::create([
            'name' => 'Admin Manager',
            'email' => 'admin@example.com',
            // Hash::make securely encrypts the password before inserting it into MySQL
            'password' => Hash::make('password123'),
        ]);

        // Attach the Spatie admin role to this user
        $admin->assignRole('admin');

        // 2. Create our permanent Employee test account
        $employee = User::create([
            'name' => 'Nathan Ramirez',
            'email' => 'employee@example.com',
            'password' => Hash::make('password123'),
        ]);

        // Attach the Spatie employee role to this user (Matches PDF assessment requirement)
        $employee->assignRole('employee');
    }
}
