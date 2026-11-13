/*
  Warnings:

  - You are about to drop the column `dataCadastro` on the `tarefa` table. All the data in the column will be lost.
  - You are about to drop the column `setor` on the `tarefa` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nome_setor` to the `Tarefa` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `tarefa` DROP COLUMN `dataCadastro`,
    DROP COLUMN `setor`,
    ADD COLUMN `data_cadastro` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `nome_setor` VARCHAR(191) NOT NULL,
    MODIFY `descricao` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_email_key` ON `Usuario`(`email`);
