import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from 'next/link';
import { User, Car, ParkingCircle } from "lucide-react";

const FrontPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex flex-col items-center justify-center p-6">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-bold mb-6 text-purple-700"
      >
        Welcome to Parking Management
      </motion.h1>

      <img
        src="https://media.istockphoto.com/id/1491069647/vector/3d-cartoon-toy-car-purple-color-vector-design-element-on-the-light-background-kids-vehicle.jpg?s=612x612&w=is&k=20&c=FvfPSGkTECJF2bGSacNQpac-mMUI14P2_F9MwXIzR6E="
        alt="Car"
        className="w-40 h-40 rounded-full shadow-lg mb-8"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card className="rounded-2xl shadow-xl">
            <CardContent className="p-6 flex flex-col items-center">
              <User className="w-12 h-12 text-blue-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">User Management</h2>
              <Link href="/vehicles">
                <Button variant="default" className="w-full">
                  Enter as User
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card className="rounded-2xl shadow-xl">
            <CardContent className="p-6 flex flex-col items-center">
              <Car className="w-12 h-12 text-green-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Parking Lot Management</h2>
              <Link href="/parking-lots">
                <Button variant="default" className="w-full">
                  Enter as Admin
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Card className="rounded-2xl shadow-xl">
            <CardContent className="p-6 flex flex-col items-center">
              <ParkingCircle className="w-12 h-12 text-orange-600 mb-4" />
              <h2 className="text-xl font-semibold mb-2">Park Now</h2>
              <Link href="/user">
                <Button variant="default" className="w-full">
                  Park My Vehicle
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default FrontPage;
