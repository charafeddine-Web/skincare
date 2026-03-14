<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AdminAnalyticsRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && (($user->role ?? null) === 'admin' || (bool) ($user->is_admin ?? false));
    }

    public function rules(): array
    {
        return [
            'limit' => 'nullable|integer|min:1|max:100',
            'days' => 'nullable|integer|min:1|max:365',
        ];
    }

    protected function prepareForValidation(): void
    {
        if (!$this->has('limit')) {
            $this->merge(['limit' => 10]);
        }
        if (!$this->has('days')) {
            $this->merge(['days' => 30]);
        }
    }
}
