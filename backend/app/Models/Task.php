<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    // 1. Protect against Mass Assignment vulnerabilities
    protected $fillable = [
        'title',
        'description',
        'status',
        'project_id',   // Link to parent project
        'task_number', // Scoped sequential ID
    ];

    // 2. Define the Many-to-Many relationship with Users
    public function users()
    {
        return $this->belongsToMany(User::class);
    }

    // 3. Define the relationship back to the parent Project
    public function project()
    {
        return $this->belongsTo(Project::class);
    }
}
