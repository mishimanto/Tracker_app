<?php

namespace Database\Seeders;

use App\Models\ExpenseCategory;
use Illuminate\Database\Seeder;

class ExpenseCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Food & Dining', 'icon' => '🍔', 'color' => '#FF6B6B', 'is_default' => true],
            ['name' => 'Transportation', 'icon' => '🚗', 'color' => '#4ECDC4', 'is_default' => true],
            ['name' => 'Shopping', 'icon' => '🛍️', 'color' => '#45B7D1', 'is_default' => true],
            ['name' => 'Entertainment', 'icon' => '🎬', 'color' => '#96CEB4', 'is_default' => true],
            ['name' => 'Bills & Utilities', 'icon' => '💡', 'color' => '#FFEAA7', 'is_default' => true],
            ['name' => 'Healthcare', 'icon' => '🏥', 'color' => '#DDA0DD', 'is_default' => true],
            ['name' => 'Education', 'icon' => '📚', 'color' => '#98D8C8', 'is_default' => true],
            ['name' => 'Other', 'icon' => '📌', 'color' => '#B0B0B0', 'is_default' => true],
        ];

        foreach ($categories as $category) {
            ExpenseCategory::create($category);
        }
    }
}
