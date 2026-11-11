<?php
namespace App\Controller;

use App\Model\Task;
use App\Service\Router;
use App\Service\Templating;

class TaskController
{
    public function indexAction(Templating $templating, Router $router): ?string
    {
        $tasks = Task::findAll();
        return $templating->render('task/index.html.php', [
            'tasks' => $tasks,
            'router' => $router,
        ]);
    }

    public function showAction(int $id, Templating $templating, Router $router): ?string
    {
        $task = Task::find($id);
        return $templating->render('task/show.html.php', [
            'task' => $task,
            'router' => $router,
        ]);
    }

    public function createAction(?array $requestData, Templating $templating, Router $router): ?string
    {
        if ($requestData) {
            $task = Task::fromArray($requestData);
            $task->save();
            $router->redirect($router->generatePath('task-index'));
            return null;
        }

        return $templating->render('task/create.html.php', [
            'task' => new Task(),
            'router' => $router,
        ]);
    }

    public function editAction(int $id, ?array $requestData, Templating $templating, Router $router): ?string
    {
        $task = Task::find($id);
        if ($requestData) {
            $task->fill($requestData);
            $task->save();
            $router->redirect($router->generatePath('task-index'));
            return null;
        }

        return $templating->render('task/edit.html.php', [
            'task' => $task,
            'router' => $router,
        ]);
    }

    public function deleteAction(int $id, Router $router): ?string
    {
        $task = Task::find($id);
        if ($task) {
            $task->delete();
        }
        $router->redirect($router->generatePath('task-index'));
        return null;
    }
}