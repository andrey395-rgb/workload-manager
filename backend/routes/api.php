<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ProjectController;

// Public Routes (No token required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes (Token required)
Route::middleware('auth:sanctum')->group(function () {

    // Task Engine Routes
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::get('/tasks/my', [TaskController::class, 'myTasks']);
    Route::patch('/tasks/{id}/status', [TaskController::class, 'updateStatus']);
    Route::post('/tasks/{id}/pickup', [TaskController::class, 'pickup']);
    Route::patch('/tasks/{id}/assignment', [TaskController::class, 'updateAssignment'])->middleware('role:admin');

    // Project Engine Routes
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::post('/projects', [ProjectController::class, 'store']);
    Route::get('/projects/{id}', [ProjectController::class, 'show']);

    // User/Employee Management
    Route::get('/users', [UserController::class, 'index']);
    Route::get('/profile/{id}', [UserController::class, 'show']);
    Route::patch('/profile/{id}', [UserController::class, 'updateProfile']);
    Route::post('/profile/{id}/photo', [UserController::class, 'updatePhoto']);
    Route::patch('/users/{id}/role', [UserController::class, 'updateRole'])->middleware('role:admin');

    Route::get('/me', function (Request $request) {
        return $request->user();
    });
});
