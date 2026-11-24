<?php

namespace App\Http\Requests;

use App\Models\ProblemReport;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProblemReportRequest extends FormRequest
{
    /**
     * Both authenticated students and public visitors can submit a problem report.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isAuthenticated = $this->user('sanctum') !== null;

        return [
            'category' => [
                'required',
                'string',
                Rule::in(ProblemReport::CATEGORIES),
            ],
            'description' => [
                'required',
                'string',
                'min:5',
                'max:5000',
            ],
            'email' => $isAuthenticated
                ? ['nullable', 'string', 'email', 'max:255']
                : ['required', 'string', 'email', 'max:255'],
        ];
    }

    /**
     * Prepare input before validation.
     */
    protected function prepareForValidation(): void
    {
        if ($this->has('description') && is_string($this->input('description'))) {
            $this->merge([
                'description' => trim($this->input('description')),
            ]);
        }

        if ($this->has('email') && is_string($this->input('email'))) {
            $trimmedEmail = trim($this->input('email'));
            $this->merge([
                'email' => $trimmedEmail !== '' ? strtolower($trimmedEmail) : null,
            ]);
        }
    }

    /**
     * Custom validation messages.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'category.required' => 'Please select a problem category.',
            'category.in' => 'Please select a valid problem category.',
            'description.required' => 'Please describe the problem you encountered.',
            'description.min' => 'Please provide at least 5 characters describing the problem.',
            'description.max' => 'Description must not exceed 5000 characters.',
            'email.required' => 'Please enter your email address so we can follow up if needed.',
            'email.email' => 'Please enter a valid email address.',
        ];
    }
}
