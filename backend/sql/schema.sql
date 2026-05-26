-- ============================================================================
-- DATABASE SCHEMA: JAES EVENT AND TASK MANAGEMENT SYSTEM
-- ============================================================================
--
-- Estrutura do banco de dados relacional.
-- Execute este script no MySQL para criar as tabelas.
--
-- ============================================================================
-- RELACIONAMENTOS:
-- ============================================================================
-- 1. events -> participants (Um-para-Muitos)
-- 2. events -> completed_events (Um-para-Um)
-- 3. events -> canceled_events (Um-para-Um)
--
-- ============================================================================

-- 1. MAIN EVENTS TABLE
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(100) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_location VARCHAR(150) NOT NULL,
    event_status ENUM('EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO') DEFAULT 'EM_ANDAMENTO',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS participants (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    age INT NOT NULL,
    event_id INT NOT NULL,
    CONSTRAINT fk_participant_event
        FOREIGN KEY (event_id) REFERENCES events(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. COMPLETED EVENTS TABLE
CREATE TABLE IF NOT EXISTS completed_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_event_id INT NOT NULL UNIQUE,
    completion_date DATE NOT NULL,
    notes TEXT,
    CONSTRAINT fk_completed_event
        FOREIGN KEY (original_event_id) REFERENCES events(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. CANCELED EVENTS TABLE
CREATE TABLE IF NOT EXISTS canceled_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    original_event_id INT NOT NULL UNIQUE,
    cancellation_reason TEXT NOT NULL,
    cancellation_date DATE NOT NULL,
    CONSTRAINT fk_canceled_event
        FOREIGN KEY (original_event_id) REFERENCES events(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
