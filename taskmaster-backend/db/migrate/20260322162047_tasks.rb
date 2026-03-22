class Tasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.string :title, null: false
      t.text :description
      t.date :due_date
      t.string :status, default: 'pending'
      t.string :email_address, null: false

      t.timestamps
    end

    add_index :tasks, :email_address
    add_foreign_key :tasks, :users, column: :email_address, primary_key: :email_address
  end
end
