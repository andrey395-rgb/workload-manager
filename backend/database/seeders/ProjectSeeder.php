<?php

namespace Database\Seeders;

use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define common enterprise project nodes
        $projects = [
            [
                'name' => 'Infrastructure Migration',
                'description' => 'Transferring legacy on-premise systems to high-availability cloud instances.',
                'status' => 'active',
            ],
            [
                'name' => 'Customer Portal Redesign',
                'description' => 'Upgrading the user interface to follow our new minimalist design system.',
                'status' => 'active',
            ],
            [
                'name' => 'Internal Security Audit',
                'description' => 'Bi-annual verification of all RBAC permissions and endpoint security protocols.',
                'status' => 'active',
            ],
        ];

        foreach ($projects as $projectData) {
            Project::create($projectData);
        }
    }
}
