import React from 'react';
import { Link } from 'wouter';
import Header from '@/components/Header';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import WebLNStatus from '@/components/WebLNStatus';
import SendPayment from '@/components/SendPayment';
import KeysendPayment from '@/components/KeysendPayment';
import MakeInvoice from '@/components/MakeInvoice';
import LightningAddress from '@/components/LightningAddress';
import PayPerScroll from '@/components/PayPerScroll';
import WalletInfo from '@/components/WalletInfo';
import { useWebLN } from '@/contexts/WebLNContext';
import { Zap, Bitcoin, ArrowRight, Info, ExternalLink } from 'lucide-react';

const Home: React.FC = () => {
  const { isConnected, connect } = useWebLN();

  return (
    <div className="container mx-auto px-4 py-8">
      <Header />
      
      <main className="space-y-10">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
          <div className="max-w-xl space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="text-bitcoin-orange">Lightning</span> App
              <span className="inline-block">
                <Zap className="h-8 w-8 inline ml-2 text-bitcoin-orange" />
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Explore the power of Bitcoin Lightning payments with WebLN integration.
              Fast, secure, and low-fee Bitcoin transactions for the modern web.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                asChild
                className="btn-bitcoin"
                size="lg"
              >
                <Link href="/dashboard">
                  <div className="flex items-center gap-2">
                    <span>Open Dashboard</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              </Button>
              
              {!isConnected && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={connect}
                  className="border-bitcoin-orange text-bitcoin-orange hover:bg-bitcoin-orange/10"
                >
                  <Bitcoin className="mr-2 h-4 w-4" />
                  Connect Wallet
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <WebLNStatus showLabel={true} />
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative">
            <div className="w-72 h-72 md:w-96 md:h-96 bg-gradient-to-br from-bitcoin-orange/20 to-bitcoin-orange/5 rounded-full flex items-center justify-center">
              <Bitcoin className="w-36 h-36 md:w-48 md:h-48 text-bitcoin-orange" />
            </div>
            <div className="absolute -bottom-4 -right-4 p-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
              <div className="text-2xl font-bold text-bitcoin-orange">WebLN Ready</div>
              <div className="text-sm text-gray-500">Bitcoin Lightning Integration</div>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <section className="mb-12">
          <h2 className="section-title text-2xl font-bold mb-8">
            <Zap className="text-bitcoin-orange" />
            WebLN Features
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Send Payment */}
            <Card className="lightning-card">
              <CardHeader>
                <CardTitle>Send Payment</CardTitle>
                <CardDescription>Pay Lightning invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Scan or paste a Lightning invoice to make a payment from your wallet.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/dashboard">
                    <div className="flex items-center">
                      Try It <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Keysend */}
            <Card className="lightning-card">
              <CardHeader>
                <CardTitle>Keysend</CardTitle>
                <CardDescription>Direct node payments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Send payments directly to Lightning nodes without requesting an invoice.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/dashboard">
                    <div className="flex items-center">
                      Try It <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Generate Invoice */}
            <Card className="lightning-card">
              <CardHeader>
                <CardTitle>Generate Invoice</CardTitle>
                <CardDescription>Request payments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Create Lightning invoices to receive payments from others.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/dashboard">
                    <div className="flex items-center">
                      Try It <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Lightning Address */}
            <Card className="lightning-card">
              <CardHeader>
                <CardTitle>Lightning Address</CardTitle>
                <CardDescription>Simple payments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Pay to Lightning addresses that look like email addresses.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/dashboard">
                    <div className="flex items-center">
                      Try It <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Pay-per-scroll */}
            <Card className="lightning-card">
              <CardHeader>
                <CardTitle>Pay-per-scroll</CardTitle>
                <CardDescription>Micropayments</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Experience an innovative micropayment model where you pay as you consume content.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/dashboard">
                    <div className="flex items-center">
                      Try It <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
            
            {/* Wallet Info */}
            <Card className="lightning-card">
              <CardHeader>
                <CardTitle>Wallet Info</CardTitle>
                <CardDescription>Node details</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  View information about your connected Lightning wallet and node.
                </p>
              </CardContent>
              <CardFooter>
                <Button asChild variant="outline">
                  <Link href="/dashboard">
                    <div className="flex items-center">
                      Try It <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
        
        {/* About WebLN Section */}
        <section className="mb-12 bg-gray-50 dark:bg-gray-900 rounded-2xl p-8">
          <h2 className="section-title text-2xl font-bold mb-6">
            <Info className="text-bitcoin-orange" />
            About WebLN
          </h2>
          
          <div className="max-w-3xl mx-auto space-y-6">
            <p className="text-lg">
              WebLN is a set of specifications that allows web applications to communicate with Lightning Network nodes
              and wallets. It enables seamless integration of Bitcoin Lightning payments into websites and web applications.
            </p>
            
            <div className="p-4 border border-bitcoin-orange/20 rounded-lg bg-white dark:bg-gray-800">
              <h3 className="font-bold text-lg mb-2">Key Benefits</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                <li>Fast, low-fee Bitcoin payments</li>
                <li>Simple API for developers</li>
                <li>User-friendly payment experience</li>
                <li>Support for micropayments</li>
                <li>Privacy-preserving transactions</li>
              </ul>
            </div>
            
            <div>
              <Button 
                variant="outline" 
                onClick={() => window.open('https://webln.dev', '_blank')}
                className="flex items-center gap-2"
              >
                <span>Learn More About WebLN</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>
        
        {/* Demo Section */}
        <section className="mb-12">
          <h2 className="section-title text-2xl font-bold mb-6">
            <Bitcoin className="text-bitcoin-orange" />
            Try the Demo
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Pay a Lightning Invoice</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Test the WebLN integration by making a small payment. You'll need a WebLN-compatible
                wallet like Alby Browser Extension.
              </p>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <SendPayment />
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Generate an Invoice</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create a Lightning invoice that others can pay. Specify the amount and description.
              </p>
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
                <MakeInvoice />
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Bitcoin className="h-6 w-6 text-bitcoin-orange" />
            <span className="text-lg font-semibold">
              Lightning<span className="text-bitcoin-orange">App</span>
            </span>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Built with ⚡ using React, TailwindCSS and WebLN
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;