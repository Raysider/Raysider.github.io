<?php
/** @var \App\Model\Task $task */
/** @var \App\Service\Router $router */

$title = 'Create Task';
$bodyClass = 'edit';

ob_start(); ?>
    <h1>Create Task</h1>
    <form action="<?= $router->generatePath('task-create') ?>" method="post" class="edit-form">
        <div class="form-group">
            <label for="title">Title</label>
            <input type="text" id="title" name="task[title]" required>
        </div>
        <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="task[description]" required></textarea>
        </div>
        <div class="form-group">
            <label for="status">Status</label>
            <input type="text" id="status" name="task[status]" value="New" required>
        </div>
        <input type="submit" value="Submit">
    </form>

    <a href="<?= $router->generatePath('task-index') ?>">Back to list</a>
<?php $main = ob_get_clean();

include __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'base.html.php';