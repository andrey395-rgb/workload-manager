<?php

namespace App\Http\Controllers;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    public function store(Request $request) {
        // 1. Validate the incoming data, now including project linkage
        $fields = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'project_id' => 'required|exists:projects,id', // Every task must belong to a valid project
            'user_ids' => 'nullable|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        // 2. Logic for Scoped Sequential ID (GitHub Style #1, #2...)
        // We find the highest task_number currently assigned to this project and increment it
        $maxTaskNumber = Task::where('project_id', $fields['project_id'])->max('task_number') ?? 0;
        $nextTaskNumber = $maxTaskNumber + 1;

        // 3. Create the task with its project and sequential identifier
        $task = Task::create([
            'title' => $fields['title'],
            'description' => $fields['description'] ?? null,
            'project_id' => $fields['project_id'],
            'task_number' => $nextTaskNumber,
        ]);

        // 4. Sync the users to the task via the pivot table
        $task->users()->sync($fields['user_ids'] ?? []);

        // 5. Return the task along with the assigned users' data
        return response()->json([
            'message' => 'Task created successfully',
            'task' => $task->load(['users', 'project'])
        ], 201);
    }

    public function pickup(Request $request, $id) {
        $task = Task::findOrFail($id);
        $user = $request->user();

        // Attach the user to the task without removing existing ones
        $task->users()->syncWithoutDetaching([$user->id]);

        return response()->json([
            'message' => 'Task successfully claimed',
            'task' => $task->load(['users', 'project'])
        ], 200);
    }
    public function myTasks(Request $request) {
        // 1. Get the currently authenticated user
        $user = $request->user();

        // 2. Retrieve all tasks assigned to this user, including parent project context
        $tasks = $user->tasks()->with('project')->get();

        // 3. Return the tasks as a JSON response
        return response()->json([
            'tasks' => $tasks
        ], 200);
    }
    public function index()
    {
        // Fetch all tasks and eager load users AND projects for the dashboard view
        $tasks = \App\Models\Task::with(['users', 'project'])->latest()->get();

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

    /**
     * Update the assigned personnel for a specific task.
     * Accessible by administrative nodes only.
     */
    public function updateAssignment(Request $request, $id)
    {
        // 1. Validate the incoming user array
        $fields = $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id'
        ]);

        // 2. Find the target task
        $task = Task::findOrFail($id);

        // 3. Sync the new personnel roster to the task node
        $task->users()->sync($fields['user_ids']);

        // 4. Return the updated task with its new context
        return response()->json([
            'message' => 'Personnel assignment synchronized successfully',
            'task' => $task->load(['users', 'project'])
        ], 200);
    }
}
