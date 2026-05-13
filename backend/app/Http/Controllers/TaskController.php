<?php

namespace App\Http\Controllers;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function store(Request $request) {
        // 1. Validate the incoming data
        $fields = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'user_ids' => 'required|array', // We expect an array of IDs
            'user_ids.*' => 'exists:users,id' // Security check: Ensure every ID in the array actually exists in the users table
        ]);

        // 2. Create the task (status defaults to 'pending' based on our database migration)
        $task = Task::create([
            'title' => $fields['title'],
            'description' => $fields['description'] ?? null,
        ]);

        // 3. The Magic: Sync the users to the task via the pivot table
        $task->users()->sync($fields['user_ids']);

        // 4. Return the task along with the assigned users' data
        return response()->json([
            'message' => 'Task created successfully',
            'task' => $task->load('users')
        ], 201);
    }
    public function myTasks(Request $request) {
        // 1. Get the currently authenticated user
        $user = $request->user();

        // 2. Retrieve all tasks assigned to this user
        $tasks = $user->tasks; // Eager load users for each task

        // 3. Return the tasks as a JSON response
        return response()->json([
            'tasks' => $tasks
        ], 200);
    }
    public function index()
    {
        // Fetch all tasks and eager load the assigned users so we can display their names on the cards
        $tasks = \App\Models\Task::with('users')->latest()->get();

        return response()->json([
            'tasks' => $tasks
        ], 200);
    }
    public function updateStatus(Request $request, $id) {
// 1. Validate the incoming request (it must be exactly one of these two strings)
        $fields = $request->validate([
            'status' => 'required|in:in_progress,completed'
        ]);

        // 2. Find the task by the ID passed in the URL (e.g., /tasks/5/status)
        // findOrFail will automatically return a 404 error if the task doesn't exist
        $task = Task::findOrFail($id);

        // 3. Security Check (Authorization): Is this user assigned to this task?
        $user = $request->user();

        // $task->users gets the array of assigned employees. contains() checks if our ID is in that list.
        if (!$task->users->contains($user->id)) {
            return response()->json([
                'message' => 'Unauthorized. You are not assigned to this task.'
            ], 403);
        }

        // 4. Update the task status and save it to the database
        $task->status = $fields['status'];
        $task->save();

        // 5. Return success
        return response()->json([
            'message' => 'Task updated successfully',
            'task' => $task
        ], 200);
    }
}
