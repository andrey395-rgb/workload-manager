<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // 1. Validate the incoming data from React
        $fields = $request->validate([
            'name' => 'required|string',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:8',
        ]);

        // 2. Create the User in the database
        $user = User::create([
            'name' => $fields['name'],
            'email' => $fields['email'],
            'password' => Hash::make($fields['password']),
        ]);

        // 3. Assign the default 'employee' role (Requirement from PDF)
        $user->assignRole('employee');

        // 4. Create an API Token for the user
        $token = $user->createToken('myapptoken')->plainTextToken;

        // 5. Return a JSON response back to React
        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }
    
    public function login(Request $request)
    {
        // 1. Validate the incoming request
        $fields = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        // 2. Check the email and password against the database
        // Auth::attempt() hashes the provided password and compares it to the database hash
        if (!auth()->attempt($fields)) {
            return response()->json([
                'message' => 'Invalid login credentials'
            ], 401);
        }

        // 3. If successful, get the user object
        $user = auth()->user();

        // 4. Create a new token for this session
        $token = $user->createToken('myapptoken')->plainTextToken;

        // 5. Send back the user data, their role, and the token
        return response()->json([
            'user' => $user,
            'role' => $user->roles->pluck('name')[0], // This pulls the 'employee' or 'admin' string
            'token' => $token
        ], 200);
    }
}
