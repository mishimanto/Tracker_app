<?php

namespace App\Repositories;

use App\Models\Expense;
use Illuminate\Database\Eloquent\Collection;

class ExpenseRepository
{
    public function getUserExpenses($userId, array $filters = [])
    {
        $query = Expense::where('user_id', $userId)->with('category');

        if (isset($filters['category_id'])) {
            $query->where('category_id', $filters['category_id']);
        }

        if (isset($filters['payment_method'])) {
            $query->where('payment_method', $filters['payment_method']);
        }

        if (isset($filters['date_from'])) {
            $query->whereDate('expense_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->whereDate('expense_date', '<=', $filters['date_to']);
        }

        if (isset($filters['search'])) {
            $query->where('description', 'like', '%' . $filters['search'] . '%');
        }

        if (isset($filters['amount_min'])) {
            $query->where('amount', '>=', $filters['amount_min']);
        }

        if (isset($filters['amount_max'])) {
            $query->where('amount', '<=', $filters['amount_max']);
        }

        return $query->orderBy('expense_date', 'desc')->get();
    }

    public function create(array $data)
    {
        return Expense::create($data);
    }

    public function update($expenseId, $userId, array $data)
    {
        $expense = Expense::where('user_id', $userId)->find($expenseId);

        if ($expense) {
            $expense->update($data);
        }

        return $expense;
    }

    public function delete($expenseId, $userId)
    {
        $expense = Expense::where('user_id', $userId)->find($expenseId);

        if ($expense) {
            return $expense->delete();
        }

        return false;
    }
}
