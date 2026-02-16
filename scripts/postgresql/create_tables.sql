-- =============================================
-- Create Tables for Crypto Wallet API
-- =============================================

-- Extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- DEPOSIT MODULE TABLES
-- =============================================

-- Table: client_wallet
CREATE TABLE client_wallet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) NOT NULL,
    wallet_address VARCHAR(255) NOT NULL,
    network VARCHAR(100) NOT NULL,
    wallet_provider VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Table: client_wallet_deposit
CREATE TABLE client_wallet_deposit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_wallet_id UUID NOT NULL,
    mount DECIMAL(28, 18) NOT NULL,
    wallet_address_origin VARCHAR(255) NOT NULL,
    crypto VARCHAR(50) NOT NULL,
    deposit_status VARCHAR(50) NOT NULL,
    transaction_hash VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- =============================================
-- TRANSACTION MODULE TABLES
-- =============================================

-- Table: easy_wallet_recipient
CREATE TABLE easy_wallet_recipient (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(255) NOT NULL,
    wallet_provider VARCHAR(255) NOT NULL,
    network VARCHAR(100) NOT NULL,
    wallet_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Table: easy_wallet_sweeping_commission
CREATE TABLE easy_wallet_sweeping_commission (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rate_commision DECIMAL(10, 4) NOT NULL,
    sweeping_commission_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Table: easy_wallet_transaction
CREATE TABLE easy_wallet_transaction (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mount DECIMAL(28, 18) NOT NULL,
    wallet_address_origin VARCHAR(255) NOT NULL,
    wallet_address_destination VARCHAR(255) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    crypto VARCHAR(50) NOT NULL,
    sweeping_commission DECIMAL(28, 18) NOT NULL,
    transaction_hash VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- Table: wallet_recovery
CREATE TABLE wallet_recovery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address VARCHAR(255) NOT NULL UNIQUE,
    private_key TEXT NOT NULL,
    phrase TEXT NOT NULL,
    wallet_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_client_wallet_user_id ON client_wallet(user_id);
CREATE INDEX idx_client_wallet_deposit_client_wallet_id ON client_wallet_deposit(client_wallet_id);
CREATE INDEX idx_client_wallet_deposit_transaction_hash ON client_wallet_deposit(transaction_hash);
CREATE INDEX idx_easy_wallet_transaction_transaction_hash ON easy_wallet_transaction(transaction_hash);
CREATE INDEX idx_wallet_recovery_wallet_address ON wallet_recovery(wallet_address);
CREATE INDEX idx_wallet_recovery_wallet_type ON wallet_recovery(wallet_type);
