import React, { useState, useEffect } from 'react';
import './App.css';

function BookClimbing() {
  const [books, setBooks] = useState([]); // 登録された本を保持する
  const [title, setTitle] = useState(''); // 本のタイトル入力値
  const [error, setError] = useState(''); // エラーメッセージ
  const [searchResults, setSearchResults] = useState([]); // 検索結果

  // Google Books APIで本を検索
  const searchBooks = async (query) => {
    if (!query) return;
    const apiKey = 'AIzaSyD4W7VvifRsmu0PkDUxwDP-4U4QfPnBQAQ'; // Google Books APIのAPIキー
    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${apiKey}`
    );
    const data = await response.json();
    if (data.items) {
      const books = data.items.map((item) => ({
        title: item.volumeInfo.title,
        pages: item.volumeInfo.pageCount || '不明',
        imageUrl: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : null
      }));
      setSearchResults(books);
    } else {
      setSearchResults([]);
    }
  };

  // タイトルが入力された時に本を検索する
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    searchBooks(newTitle);
  };

  // 本をデータベースに追加する処理
  const addBook = async (selectedBook) => {
    if (!selectedBook || isNaN(selectedBook.pages)) {
      setError('有効な本を選択してください');
      return;
    }

    try {
      // バックエンドに本のデータを送信して登録
      const response = await fetch('http://localhost:5000/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedBook),
      });

      const newBook = await response.json();
      setBooks([...books, newBook]);

      // 入力フィールドをクリア
      setTitle('');
      setError('');
      setSearchResults([]);
    } catch (error) {
      setError('本の登録に失敗しました。');
    }
  };

  // 本を削除する処理
  const removeBook = async (bookId) => {
    try {
      // バックエンドに削除リクエストを送信
      await fetch(`http://localhost:5000/api/books/${bookId}`, {
        method: 'DELETE',
      });

      // 本のリストをフロントエンド側で更新
      setBooks(books.filter((book) => book._id !== bookId));
    } catch (error) {
      setError('本の削除に失敗しました。');
    }
  };

  // データベースから本のリストを取得する処理
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('http://localhost:5000/books');
        const data = await response.json();
        setBooks(data);
      } catch (error) {
        setError('本の取得に失敗しました。');
      }
    };

    fetchBooks();
  }, []);

  // 総ページ数の計算
  const totalPages = books.reduce((sum, book) => sum + parseInt(book.pages, 10), 0);

  // 登山進捗の計算（1ページ1センチとして富士山を基準）
  const progress = Math.min((totalPages / 377600) * 100, 100);

  return (
    <div className="App">
      <h1>BookClimbing</h1>
      <div className="book-form">
        <input
          type="text"
          placeholder="本のタイトルを入力して検索"
          value={title}
          onChange={handleTitleChange}
        />
        {searchResults.length > 0 && (
          <ul className="search-results">
            {searchResults.map((book, index) => (
              <li key={index} onClick={() => addBook(book)}>
                {book.imageUrl && <img src={book.imageUrl} alt={book.title} />}
                {book.title} - {book.pages}ページ
              </li>
            ))}
          </ul>
        )}
        {error && <p className="error">{error}</p>}
      </div>

      <h2>登山の進捗: {progress.toFixed(2)}%</h2>

      <div className="mountain-container">
        <div className="mountain">
          <div
            className="climber"
            style={{ bottom: `${progress}%`, left: `${50 - progress / 2}%` }}  // 左右移動も追加
          >
            <img src="./images/climber.png" alt="Climber" className="climber-image" />
          </div>
        </div>
      </div>


      <h3>読んだ本のリスト</h3>
      {books.length > 0 ? (
        <div className="book-list">
          {books.map((book) => (
            <div key={book._id} className="book-card">
              {book.imageUrl && (
                <>
                  <img src={book.imageUrl} alt={book.title} className="book-card-image" />
                  <button onClick={() => removeBook(book._id)} className="remove-button">×</button>
                </>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>まだ本が登録されていません。</p>
      )}
    </div>
  );
}

export default BookClimbing;
