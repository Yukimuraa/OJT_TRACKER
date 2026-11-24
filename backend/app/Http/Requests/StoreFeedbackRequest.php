<?php

namespace App\Http\Requests;

use App\Models\Feedback;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFeedbackRequest extends FormRequest
{
    /**
     * Public visitors and authenticated students may attempt submission; controller enforces role checks.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Prepare input before validation (sanitize control characters and normalize default preference).
     */
    protected function prepareForValidation(): void
    {
        $rawComment = (string) $this->input('comment', '');
        $cleanComment = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $rawComment) ?? $rawComment;

        $preference = $this->input('display_name_preference');
        if ($preference === null || $preference === '') {
            $preference = Feedback::DISPLAY_ANONYMOUS;
        }

        $this->merge([
            'comment' => trim($cleanComment),
            'display_name_preference' => trim((string) $preference),
        ]);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['required', 'string', 'min:5', 'max:1500'],
            'display_name_preference' => [
                'nullable',
                'string',
                Rule::in(Feedback::DISPLAY_PREFERENCES),
            ],
        ];
    }

    /**
     * Custom validation messages for clearer user feedback.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'rating.required' => 'Please select an overall rating between 1 and 5 stars.',
            'rating.integer' => 'Rating must be a whole number from 1 to 5.',
            'rating.min' => 'Rating must be at least 1 star.',
            'rating.max' => 'Rating cannot exceed 5 stars.',
            'comment.required' => 'Please write your feedback before submitting.',
            'comment.min' => 'Please write at least 5 characters in your feedback.',
            'comment.max' => 'Feedback cannot exceed 1,500 characters.',
            'display_name_preference.in' => 'Invalid display name preference selected.',
        ];
    }
}
