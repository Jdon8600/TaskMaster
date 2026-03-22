class TaskUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users, id: false do |t|
      t.string :email_address, primary_key: true, null: false
      t.string :first_name, null: false
      t.string :last_name, null: false
      t.string :password_digest, null: false

      t.timestamps
    end

    add_index :users, :email_address, unique: true
  end
end
