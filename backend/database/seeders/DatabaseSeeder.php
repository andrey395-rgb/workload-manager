<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Execute seeders in sequential order to maintain integrity
        $this->call([
            RolesAndPermissionsSeeder::class,
            UserSeeder::class,
            ProjectSeeder::class,
        ]);
    }
}
