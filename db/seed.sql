-- テストユーザーの作成
INSERT INTO users (email, name, password_hash) VALUES
('test@example.com', 'テストユーザー', 'dummy_hash'),
('admin@example.com', '管理者', 'dummy_hash');

-- テストプロジェクトの作成
INSERT INTO projects (name, description) VALUES
('プロジェクトA', '社内システム開発プロジェクト'),
('プロジェクトB', 'クライアントWebサイト制作');

-- プロジェクトメンバーの設定
INSERT INTO project_members (project_id, user_id, role) VALUES
(1, 1, 'member'),
(1, 2, 'admin'),
(2, 1, 'member');

-- テスト用の工数記録
INSERT INTO time_entries (user_id, project_id, date, hours, description) VALUES
(1, 1, CURRENT_DATE, 4.5, '設計作業'),
(1, 2, CURRENT_DATE, 3.0, 'コーディング'),
(2, 1, CURRENT_DATE - 1, 6.0, 'レビュー作業'); 