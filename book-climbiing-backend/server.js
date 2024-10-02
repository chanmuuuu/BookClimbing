const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// MongoDB接続
mongoose.connect('mongodb://localhost:27017/book_climbing', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// スキーマの作成
const bookSchema = new mongoose.Schema({
  title: String,
  pages: Number,
  imageUrl: String,
});

const Book = mongoose.model('Book', bookSchema);

// 本のリストを取得
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find(); // 全ての本を取得
    res.status(200).json(books); // JSON形式で返す
  } catch (error) {
    res.status(500).json({ message: '本の取得中にエラーが発生しました。' });
  }
});


// 本を追加
app.post('/books', async (req, res) => {
  try {
    const { title, pages, imageUrl } = req.body;

    // 新しい本のドキュメントを作成
    const newBook = new Book({ title, pages, imageUrl });

    // MongoDBに保存
    await newBook.save();

    // 成功レスポンスを送信
    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ message: '本の登録中にエラーが発生しました。' });
  }
});


// 本を削除
app.delete('/api/books/:id', async (req, res) => {
  await Book.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

// サーバーの起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
