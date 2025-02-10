import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const gridSize = 4;
const targetSum = 13;
const maxLives = 5;

const generateGrid = () => {
  return Array(gridSize)
    .fill(0)
    .map(() =>
      Array(gridSize)
        .fill(0)
        .map(() => Math.floor(Math.random() * 7) + 3)
    );
};

export const GameGrid = () => {
  const [grid, setGrid] = useState(generateGrid);
  const [selectedCells, setSelectedCells] = useState([]);
  const [currentSum, setCurrentSum] = useState(0);
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [lives, setLives] = useState(maxLives);

  useEffect(() => {
    if (isDragging && currentSum === targetSum) {
      setMessage("Correct! Path adds up to " + targetSum);
      setTimeout(() => {
        setGrid(generateGrid);
        setSelectedCells([]);
        setCurrentSum(0);
        setMessage("");
      }, 2000);
    }
  }, [currentSum, isDragging]);

  const handleCellMouseDown = (row, col) => {
    setIsDragging(true);
    setSelectedCells([{ row, col }]);
    setCurrentSum(grid[row][col]);
  };

  const handleCellMouseEnter = (row, col) => {
    if (isDragging && isValidMove(row, col)) {
      const newSelectedCells = [...selectedCells, { row, col }];
      const newSum = newSelectedCells.reduce(
        (sum, cell) => sum + grid[cell.row][cell.col],
        0
      );
      setSelectedCells(newSelectedCells);
      setCurrentSum(newSum);
    }
  };

  const handleMouseUp = () => {
    if (currentSum !== targetSum) {
      setSelectedCells([]);
      setCurrentSum(0);
      setLives((prev) => Math.max(prev - 1, 0));
      if (lives - 1 === 0) {
        setMessage("Game Over! Restarting...");
        setTimeout(() => {
          setLives(maxLives);
          setGrid(generateGrid);
          setSelectedCells([]);
          setCurrentSum(0);
          setMessage("");
        }, 2000);
      }
    }
    setIsDragging(false);
  };

  const isValidMove = (row, col) => {
    const lastCell = selectedCells[selectedCells.length - 1];
    if (!lastCell) return true;
    return (
      Math.abs(lastCell.row - row) <= 1 && Math.abs(lastCell.col - col) <= 1
    );
  };

  return (
    <div className="flex flex-col items-center p-4" onMouseUp={handleMouseUp}>
      <h1 className="text-xl font-bold mb-2">
        Find paths that add up to {targetSum}
      </h1>
      <p className="text-lg font-semibold">Lives: {lives}</p>
      <div className="grid grid-cols-4 gap-2">
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              className={`w-16 h-16 flex items-center justify-center border rounded-xl text-lg font-bold cursor-pointer ${
                selectedCells.some(
                  (cell) => cell.row === rowIndex && cell.col === colIndex
                )
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
              onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
              onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
            >
              {value}
            </motion.div>
          ))
        )}
      </div>
      <p className="mt-4 text-lg font-semibold">Current Sum: {currentSum}</p>
      <p className="mt-2 text-green-600 font-bold">{message}</p>
    </div>
  );
};
