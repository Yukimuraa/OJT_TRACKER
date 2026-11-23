<?php

namespace App\Http\Requests\Auth;

use App\Models\School;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalize optional student_id and default school_id before validation.
     */
    protected function prepareForValidation(): void
    {
        $merge = [];

        if ($this->has('student_id')) {
            $trimmed = trim((string) $this->input('student_id'));
            $merge['student_id'] = $trimmed !== '' ? $trimmed : null;
        }

        if (! $this->has('school_id') || $this->input('school_id') === null || $this->input('school_id') === '') {
            $defaultSchool = School::first() ?? School::create([
                'name' => 'Default Institution',
                'code' => 'DEFAULT',
            ]);
            $merge['school_id'] = $defaultSchool->id;
        }

        if (! empty($merge)) {
            $this->merge($merge);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'confirmed', Password::min(8)->letters()->numbers()],
            'school_id' => ['required', 'integer', 'exists:schools,id'],
            'student_id' => [
                'nullable',
                'string',
                'max:50',
                Rule::unique('student_profiles', 'student_id')->where('school_id', $this->input('school_id')),
            ],
            'required_hours' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:5000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'student_id.unique' => 'This student ID has already been registered for the selected school.',
            'school_id.exists' => 'The selected school does not exist.',
        ];
    }
}
