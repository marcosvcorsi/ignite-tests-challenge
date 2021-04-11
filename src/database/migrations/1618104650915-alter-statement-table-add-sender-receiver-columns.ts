import {MigrationInterface, QueryRunner, TableColumn, TableForeignKey} from "typeorm";

export class alterStatementTableAddSenderReceiverColumns1618104650915 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.addColumns('statements', [
        new TableColumn({
          name: 'sender_id',
          type: 'uuid',
          isNullable: true,
        }),
        new TableColumn({
          name: 'receiver_id',
          type: 'uuid',
          isNullable: true,
        })
      ]);

      await queryRunner.createForeignKeys('statements', [
        new TableForeignKey({
          name: 'senders',
          columnNames: ['sender_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        }),
        new TableForeignKey({
          name: 'receivers',
          columnNames: ['receiver_id'],
          referencedTableName: 'users',
          referencedColumnNames: ['id'],
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        })
      ])
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
      await queryRunner.dropForeignKey('statements', 'senders');
      await queryRunner.dropForeignKey('statements', 'receivers');

      await queryRunner.dropColumn('statements', 'receiver_id');
      await queryRunner.dropColumn('statements', 'sender_id');
    }

}
