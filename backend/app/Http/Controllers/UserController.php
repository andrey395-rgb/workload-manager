<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        // We only want to return users who have the 'employee' role.
        // We do NOT want Admins showing up in the task assignment dropdown!
        // Spatie provides the role() method for this exact scenario.
        // Eager load 'media' to avoid N+1 issues with avatar URLs.
        $employees = User::role('employee')->with('media')->get();

        return response()->json([
            'users' => $employees
        ], 200);
    }
    public function show($id)
    {
        // This method is just an example of how you might return the currently logged-in user's details.
        // You can customize this to return whatever user information you want.
        $user = User::findOrFail($id); // Get the user by ID

        return response()->json([
            'user' => $user,
            'avatar_url' => $user->getFirstMediaUrl('avatar') // Assuming you have an accessor for this in your User model
        ], 200);
    }
    public function updateProfile(Request $request, $id)
    {
        // 1. Find the user
        $user = User::findOrFail($id);

        // 2. Security Check: Only allow users to update their OWN profile
        // (Unless they are an admin, but we'll keep it simple for now)
        if ($request->user()->id !== $user->id) {
            return response()->json(['message' => 'Unauthorized to edit this profile'], 403);
        }

        // 3. Validate the text fields AND the image file
        $fields = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id, // Allow them to keep their current email
            'password' => 'sometimes|string|min:8',
            'profile_photo' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048', // Max 2MB image
        ]);

        // 4. Update the basic text info if it was provided
        if (isset($fields['name'])) $user->name = $fields['name'];
        if (isset($fields['email'])) $user->email = $fields['email'];
        if (isset($fields['password'])) $user->password = \Illuminate\Support\Facades\Hash::make($fields['password']);

        $user->save();

        // 5. The Magic: Handle the file upload with Spatie
        if ($request->hasFile('profile_photo')) {
            // If they already had a photo, Spatie deletes the old one automatically when we add a new one
            // because we specify the 'avatar' collection
            $user->addMediaFromRequest('profile_photo')->toMediaCollection('avatar');
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user,
            'avatar_url' => $user->getFirstMediaUrl('avatar')
        ], 200);
    }
    public function updatePhoto(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $request->validate(['profile_photo' => 'required|image|mimes:jpeg,png,jpg|max:2048']);
        $user->clearMediaCollection('avatar');
        $user->addMediaFromRequest('profile_photo')->toMediaCollection('avatar');
        return response()->json(['avatar_url' => $user->getFirstMediaUrl('avatar')]);
    }
    public function updateRole(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'role' => 'required|string|in:admin,employee',
        ]);

        // Remove all current roles and assign the new one
        $user->syncRoles([$request->role]);

        return response()->json([
            'message' => 'Role updated successfully',
            'user' => $user,
            'role' => $request->role,
        ], 200);
    }
}
