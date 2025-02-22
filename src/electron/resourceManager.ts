import osUtils from "os-utils";
import fs from "fs";
import os from "os";
const interval = 500;

export function pollResources() {
  setInterval(async () => {
    const cpuUsage = await getCpuUsage();
    const ramUsage = getRamUsage();
    const storageUsage = getStorageUsage();

    console.log({ cpuUsage, ramUsage, storageUsage: storageUsage.usage });
  }, interval);
}

export function getStaticData() {
  const totalStorage = getStorageUsage().total;
  const CpuModel = os.cpus()[0].model;
  const totalMemory = Math.floor(osUtils.totalmem() / 1_000_000_000);
  return { totalStorage, CpuModel, totalMemory };
}

function getCpuUsage() {
  return new Promise((resolve) => {
    osUtils.cpuUsage(resolve);
  });
}

function getRamUsage() {
  return 1 - osUtils.freememPercentage();
}

function getStorageUsage() {
  const stats = fs.statfsSync(process.platform === "win32" ? "C:" : "/");
  const total = stats.bsize * stats.blocks;
  const free = stats.bsize * stats.bfree;

  return {
    total: Math.floor(total / 1_000_000_000),
    free: Math.floor(free / 1_000_000_000),
    usage: 1 - free / total,
  };
}
