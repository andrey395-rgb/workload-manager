<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController; // We will create this next!
use App\Http\Controllers\UserController; // We will create this next!

// Public Routes (No token required)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected Routes (Token required)
Route::middleware('auth:sanctum')->group(function () {

    // We will add our task and user routes inside this block
    Route::post('/tasks', [TaskController::class, 'store']);
    Route::get('/tasks/my', [TaskController::class, 'myTasks']);
    Route::patch('/tasks/{id}/status', [TaskController::class, 'updateStatus']);
    Route::get('/users', [UserController::class, 'index']);
    //show()
// Fetch a user's profile information
    Route::get('/profile/{id}', [UserController::class, 'show']);

    // Update profile details and upload a profile photo
    Route::patch('/profile/{id}', [UserController::class, 'updateProfile']);
    Route::post('/profile/{id}/photo', [UserController::class, 'updatePhoto']);
        // Example: A route to log out the user (revoke the token)
    // Example: A route to get the currently logged-in user's details
    Route::get('/me', function (Request $request) {
        return $request->user();
    });
    Route::get('/tasks', [TaskController::class, 'index']);
    Route::patch('/users/{id}/role', [UserController::class, 'updateRole'])
    ->middleware('role:admin');
});
