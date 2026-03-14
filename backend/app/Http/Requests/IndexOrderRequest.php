<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $user = $this->user();
        $isAdmin = $user && (($user->role ?? null) === 'admin' || (bool) ($user->is_admin ?? false));

        $rules = [
            'user_id' => $isAdmin ? 'nullable|exists:users,id' : 'prohibited',
            'status' => ['nullable', 'string', Rule::in(['pending', 'paid', 'failed', 'shipped', 'delivered', 'cancelled'])],
            'min_amount' => 'nullable|numeric|min:0',
            'max_amount' => 'nullable|numeric|min:0|gte:min_amount',
            'search' => 'nullable|string|max:255',
            'date' => 'nullable|date',
            'per_page' => 'nullable|integer|min:1|max:100',
        ];

        return $rules;
    }
}
