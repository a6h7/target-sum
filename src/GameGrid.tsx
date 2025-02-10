import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const gridSize: number = 4;
const generateTargetSum = (): number => Math.floor(Math.random() * 20) + 5;
let targetSum: number = generateTargetSum();
const maxLives: number = 5;

interface Cell {
  row: number;
  col: number;
}

type Grid = number[][];

type HTMLElementWithDataset = HTMLElement & {
  dataset: {
    row?: string;
    col?: string;
  };
};

const generateGrid = (): Grid => {
  return Array(gridSize)
    .fill(0)
    .map(() =>
      Array(gridSize)
        .fill(0)
        .map(() => Math.floor(Math.random() * 7) + 3)
    );
};

export const GameGrid = () => {
  const [grid, setGrid] = useState<Grid>(generateGrid);
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [currentSum, setCurrentSum] = useState<number>(0);
  const [message, setMessage] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [lives, setLives] = useState<number>(maxLives);

  useEffect(() => {
    if (isDragging && currentSum === targetSum) {
      setMessage("Correct! Path adds up to " + targetSum);
      setTimeout(() => {
        targetSum = generateTargetSum();
        setGrid(generateGrid);
        setSelectedCells([]);
        setCurrentSum(0);
        setMessage("");
      }, 500);
    }
  }, [currentSum, isDragging]);

  const handleCellTouchStart = (
    row: number,
    col: number,
    event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ): void => {
    event.preventDefault();
    setIsDragging(true);
    setSelectedCells([{ row, col }]);
    setCurrentSum(grid[row][col]);
  };

  const handleCellMouseEnter = (row: number, col: number): void => {
    if (isDragging && isValidMove(row, col)) {
      if (selectedCells.some((cell) => cell.row === row && cell.col === col)) {
        return; // Prevent adding the same cell multiple times
      }
      const newSelectedCells: Cell[] = [...selectedCells, { row, col }];
      const newSum: number = newSelectedCells.reduce(
        (sum, cell) => sum + grid[cell.row][cell.col],
        0
      );
      setSelectedCells(newSelectedCells);
      setCurrentSum(newSum);
    }
  };

  const handleCellTouchMove = (event: React.TouchEvent): void => {
    event.preventDefault();
    const touch = event.touches[0];
    const element = document.elementFromPoint(
      touch.clientX,
      touch.clientY
    ) as HTMLElementWithDataset | null;
    if (element && element.dataset.row && element.dataset.col) {
      const row = parseInt(element.dataset.row, 10);
      const col = parseInt(element.dataset.col, 10);
      if (isValidMove(row, col)) {
        handleCellMouseEnter(row, col);
      }
    }
  };

  const handleMouseUp = (): void => {
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

  const isValidMove = (row: number, col: number): boolean => {
    const lastCell = selectedCells[selectedCells.length - 1];
    if (!lastCell) return true;
    return (
      Math.abs(lastCell.row - row) <= 1 && Math.abs(lastCell.col - col) <= 1 // Allow diagonal movement
    );
  };

  return (
    <div
      className="flex flex-col items-center p-4 touch-none"
      onMouseUp={handleMouseUp}
      onTouchEnd={handleMouseUp}
    >
      <h1 className="text-xl font-bold mb-2">
        Find paths that add up to {targetSum}
      </h1>
      <p className="text-lg font-semibold">Lives: {lives}</p>
      <div className="grid grid-cols-4 gap-2">
        {grid.map((row, rowIndex) =>
          row.map((value, colIndex) => (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              data-row={rowIndex}
              data-col={colIndex}
              className={`w-16 h-16 flex items-center justify-center border rounded-xl text-lg font-bold cursor-pointer ${
                selectedCells.some(
                  (cell) => cell.row === rowIndex && cell.col === colIndex
                )
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200"
              }`}
              onMouseDown={(event: React.MouseEvent<HTMLDivElement>) =>
                handleCellTouchStart(rowIndex, colIndex, event)
              }
              onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
              onTouchStart={(event: React.TouchEvent<HTMLDivElement>) =>
                handleCellTouchStart(rowIndex, colIndex, event)
              }
              onTouchMove={handleCellTouchMove}
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
