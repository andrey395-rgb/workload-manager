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
    ];

    // 2. Define the Many-to-Many relationship with Users
    public function users()
    {
        return $this->belongsToMany(User::class);
    }
}
