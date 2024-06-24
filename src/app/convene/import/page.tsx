'use client';

import { useCallback, useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const PS_SCRIPT = `Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex "&{$((New-Object System.Net.WebClient).DownloadString('https://static.mystwiz.net/wutheringwaves/getlink.ps1'))}"`;
const VALID_URL_PATH =
  'https://aki-gm-resources-oversea.aki-game.net/aki/gacha/index.html';

export default function ImportConveneHistory() {
  const [inputUrl, setInputUrl] = useState('');
  const [isBusy, setIsBusy] = useState(false);
  const [isScriptCopied, setIsScriptCopied] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleImport = useCallback(async () => {
    if (isBusy || !inputUrl) {
      !inputUrl &&
        setError(
          'Please paste your convene history URL in the input field above.',
        );
      return;
    }

    setIsBusy(true);
    setError('');

    try {
      const url = new URL(inputUrl);
      if (url.origin + url.pathname !== VALID_URL_PATH) {
        throw new Error('Please provide the URL of your convene history page.');
      }

      const queryParams = Object.fromEntries(
        new URLSearchParams(url.hash.split('?')[1]),
      );
      localStorage.setItem('gachaQueryParams', JSON.stringify(queryParams));
      router.push('/convene');
    } catch (error) {
      console.error('An error occurred:', error);
      setError(
        error instanceof Error ? error.message : 'An unknown error occurred.',
      );
    } finally {
      setIsBusy(false);
    }
  }, [inputUrl, isBusy, router]);

  const copyPowerShellScript = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(PS_SCRIPT);
      setIsScriptCopied(true);
    } catch (error) {
      console.error('An error occurred while copying the script:', error);
    }
  }, []);

  return (
    <div className="flex flex-col flex-wrap gap-4">
      <h1 className="text-3xl font-extrabold md:text-4xl scroll-m-20">
        Import Convene History
      </h1>
      <Alert>
        <AlertTitle>Read Me!</AlertTitle>
        <AlertDescription>
          Please open your convene history page in Wuthering Waves before
          following the instructions!
        </AlertDescription>
      </Alert>
      <div className="w-full">
        <h2 className="text-xl font-bold md:text-2xl">Instructions</h2>
        <p>Copy the PowerShell script below and run it in your PowerShell.</p>
        <div className="w-full mb-4">
          <pre className="flex-wrap p-4 mb-2 text-xs break-words whitespace-pre-wrap bg-gray-100 rounded-md sm:text-sm text-wrap dark:bg-neutral-800 dark:text-white">
            {PS_SCRIPT}
          </pre>
          <Button
            onClick={copyPowerShellScript}
            className="flex-shrink-0"
            style={{ height: 'auto' }}
          >
            {isScriptCopied ? 'Copied!' : 'Copy PowerShell Script'}
          </Button>
        </div>
        <div className="w-full">
          <p>Paste your convene history URL below.</p>
          <Input
            name="url-input"
            type="url"
            className="flex-grow w-full"
            placeholder="Paste URL here"
            value={inputUrl}
            required
            onChange={(e) => setInputUrl(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex justify-between">
        <Button size="lg" variant="secondary">
          <Link href="/convene">Cancel</Link>
        </Button>
        <Button size="lg" onClick={handleImport}>
          {isBusy ? 'Importing...' : 'Import'}
        </Button>
      </div>
    </div>
  );
}
