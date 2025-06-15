const db = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || '12345';

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ message: 'Usuário ou senha incorretos' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Senha incorreta' });
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error("ERRO NO LOGIN:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getProdutos = async (req, res) => {
  try {
    const [produtos] = await db.query('SELECT * FROM produtos');
    res.status(200).json(produtos);
  } catch (error) {
    console.error("ERRO AO BUSCAR PRODUTOS:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
};

exports.getProdutoById = async (req, res) => {
  console.log("--- ROTA GET /produtos/:id FOI ACIONADA ---");

  const { id } = req.params;
  console.log(`Procurando pelo produto com ID: ${id}`);

  try {
    const [rows] = await db.query('SELECT * FROM produtos WHERE id = ?', [id]);
    
    console.log("Resultado da consulta ao banco:", rows);

    if (rows.length > 0) {
      console.log("Produto encontrado! A enviar para o front-end.");
      res.status(200).json(rows[0]);
    } else {
      console.log("Nenhum produto encontrado com este ID. A enviar erro 404.");
      res.status(404).json({ message: 'Produto não encontrado' });
    }
  } catch (error) {
    console.error("!!! ERRO CRÍTICO NA FUNÇÃO getProdutoById:", error);
    res.status(500).json({ message: "Erro interno do servidor." });
  }
};


exports.addProduto = async (req, res) => {
  const { nome, descricao, preco, estoque, imagemURL } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO produtos (nome, descricao, preco, estoque, imagemURL) VALUES (?, ?, ?, ?, ?)',
      [nome, descricao, preco, estoque, imagemURL]
    );
    res.status(201).json({ id: result.insertId, nome, descricao, preco, estoque, imagemURL });
  } catch (error) {
    console.error("ERRO AO ADICIONAR PRODUTO:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduto = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco, estoque, imagemURL } = req.body;
  try {
    await db.query(
      'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, estoque = ?, imagemURL = ? WHERE id = ?',
      [nome, descricao, preco, estoque, imagemURL, id]
    );
    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (error) {
    console.error("ERRO AO ATUALIZAR PRODUTO:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduto = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM produtos WHERE id = ?', [id]);
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (error) {
    console.error("ERRO AO DELETAR PRODUTO:", error);
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  login: exports.login,
  getProdutos: exports.getProdutos,
  getProdutoById: exports.getProdutoById,
  addProduto: exports.addProduto,
  updateProduto: exports.updateProduto,
  deleteProduto: exports.deleteProduto,
};
