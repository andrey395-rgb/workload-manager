<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    // Enable mass assignment for core project attributes
    protected $fillable = [
        'name',
        'description',
        'status',
    ];

    // One project can contain many individual tasks
    public function tasks()
    {
        return $this->hasMany(Task::class);
    }
}
