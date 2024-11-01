-- テストユーザーの作成（パスワードは 'password'）
INSERT INTO users (email, name, password_hash) VALUES
('test@example.com', 'テストユーザー', '$2a$10$rKN3vmWPwJ6Y6cX1TPEode2JMJ.JzQJpV8qW0vH.qD7DpVZ1c3vS2'),
('admin@example.com', '管理者', '$2a$10$rKN3vmWPwJ6Y6cX1TPEode2JMJ.JzQJpV8qW0vH.qD7DpVZ1c3vS2');

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

-- 作業種別のテストデータ
INSERT INTO work_types (name, description) VALUES
('開発', 'プログラミング、実装作業'),
('設計', 'システム設計、DB設計'),
('テスト', 'テスト実施、バグ修正'),
('ミーティング', '打ち合わせ、レビュー'),
('ドキュメント作成', '設計書、マニュアルの作成'); 