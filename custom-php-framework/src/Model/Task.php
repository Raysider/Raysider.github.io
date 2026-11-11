<?php
namespace App\Model;

use App\Service\Config;
use PDO;

class Task
{
    private ?int $id = null;
    private ?string $title = null;
    private ?string $description = null;
    private ?string $status = null;

    public function getId(): ?int { return $this->id; }
    public function setId(?int $id): self { $this->id = $id; return $this; }

    public function getTitle(): ?string { return $this->title; }
    public function setTitle(?string $title): self { $this->title = $title; return $this; }

    public function getDescription(): ?string { return $this->description; }
    public function setDescription(?string $description): self { $this->description = $description; return $this; }

    public function getStatus(): ?string { return $this->status; }
    public function setStatus(?string $status): self { $this->status = $status; return $this; }

    public static function fromArray(array $array): self
    {
        $task = new self();
        $task->fill($array);
        return $task;
    }

    public function fill(array $array): self
    {
        if (isset($array['id'])) $this->setId((int)$array['id']);
        if (isset($array['title'])) $this->setTitle($array['title']);
        if (isset($array['description'])) $this->setDescription($array['description']);
        if (isset($array['status'])) $this->setStatus($array['status']);
        return $this;
    }

    public static function findAll(): array
    {
        $pdo = new PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $stmt = $pdo->query("SELECT * FROM task");
        $tasks = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $tasks[] = self::fromArray($row);
        }
        return $tasks;
    }

    public static function find(int $id): ?self
    {
        $pdo = new PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $stmt = $pdo->prepare("SELECT * FROM task WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? self::fromArray($row) : null;
    }

    public function save(): void
    {
        $pdo = new PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        if ($this->id) {
            $stmt = $pdo->prepare("UPDATE task SET title = :title, description = :description, status = :status WHERE id = :id");
            $stmt->execute([
                'title' => $this->title,
                'description' => $this->description,
                'status' => $this->status,
                'id' => $this->id
            ]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO task (title, description, status) VALUES (:title, :description, :status)");
            $stmt->execute([
                'title' => $this->title,
                'description' => $this->description,
                'status' => $this->status
            ]);
            $this->id = (int)$pdo->lastInsertId();
        }
    }

    public function delete(): void
    {
        $pdo = new PDO(Config::get('db_dsn'), Config::get('db_user'), Config::get('db_pass'));
        $stmt = $pdo->prepare("DELETE FROM task WHERE id = :id");
        $stmt->execute(['id' => $this->id]);
    }
}