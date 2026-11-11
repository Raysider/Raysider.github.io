<?php
/** @var \App\Model\Task $task */
/** @var \App\Service\Router $router */

$title = "Task: {$task->getTitle()}";
$bodyClass = 'show';

ob_start(); ?>
    <h1><?= htmlspecialchars($task->getTitle()) ?></h1>
    <p><strong>Status:</strong> <?= htmlspecialchars($task->getStatus()) ?></p>
    <article>
        <?= nl2br(htmlspecialchars($task->getDescription())) ?>
    </article>

    <ul class="action-list">
        <li><a href="<?= $router->generatePath('task-index') ?>">Back to list</a></li>
        <li><a href="<?= $router->generatePath('task-edit', ['id' => $task->getId()]) ?>">Edit</a></li>
    </ul>
<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';