class Booking {
    constructor(facility, date, start, end, cost) {
        this.facility = facility;
        this.date = date;
        this.start = start;
        this.end = end;
        this.cost = cost;
    }
}

class FacilityBookingModule {
    constructor(facilities) {
        this.bookings = {}; 
        this.facilities = facilities;
    }

    getFacilityConfig(facilityName) {
        return this.facilities.find(facility => facility.name === facilityName);
    }

    timeToMinutes(time) {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    bookFacility(facilityName, date, startTime, endTime) {
        const start = this.timeToMinutes(startTime);
        const end = this.timeToMinutes(endTime);
        const facilityConfig = this.getFacilityConfig(facilityName);

        if (!facilityConfig) {
            return `Booking Failed, Unknown Facility`;
        }

        if (!this.bookings[facilityName]) {
            this.bookings[facilityName] = {};
        }

        if (!this.bookings[facilityName][date]) {
            this.bookings[facilityName][date] = [];
        }

        if (this.isBookingConflict(facilityName, date, start, end)) {
            return `Booking Failed, Already Booked`;
        }

        const cost = this.calculateCost(facilityConfig, start, end);
        this.bookings[facilityName][date].push(new Booking(facilityName, date, start, end, cost));
        return `Booked, Rs. ${cost}`;
    }

    isBookingConflict(facilityName, date, start, end) {
        for (let booking of this.bookings[facilityName][date]) {
            if ((start < booking.end) && (end > booking.start)) {
                return true;
            }
        }
        return false;
    }

    calculateCost(facilityConfig, start, end) {
        let totalCost = 0;

        if (facilityConfig.type === 'slot') {
            totalCost = this.calculateSlotCost(facilityConfig, start, end);
        } else if (facilityConfig.type === 'hour') {
            totalCost = facilityConfig.rate * (end - start) / 60;
        }

        return totalCost;
    }

    calculateSlotCost(facilityConfig, start, end) {
        let totalCost = 0;
        let current = start;

        while (current < end) {
            const slot = facilityConfig.slots.find(s => {
                const slotStart = s.start[0] * 60 + s.start[1];
                const slotEnd = s.end[0] * 60 + s.end[1];
                return current < slotEnd && end > slotStart;
            });

            if (slot) {
                const slotStart = slot.start[0] * 60 + slot.start[1];
                const slotEnd = slot.end[0] * 60 + slot.end[1];
                const overlapEnd = Math.min(end, slotEnd);
                totalCost += slot.rate * (overlapEnd - current) / 60;
                current = overlapEnd;
            } else {
                break;
            }
        }

        return totalCost;
    }
}

const facilities = [
    {
        name: 'Clubhouse',
        type: 'slot',
        slots: [
            { start: [10, 0], end: [16, 0], rate: 100 },
            { start: [16, 0], end: [22, 0], rate: 500 }
        ],
        rate: 0 
    },
    {
        name: 'Tennis Court',
        type: 'hour',
        slots: [], 
        rate: 50
    }
];

function assertEquals(actual, expected, testName) {
    console.log("--------------------");
    if (actual === expected) {
        console.log(`PASS: ${testName}:\n \n Expected: '${expected}'\n Received: '${actual}'`);
    } else {
        console.log(`FAIL: ${testName}:\n \n Expected: '${expected}'\n Received: '${actual}'`);
    }
    console.log();
}

// Test cases
function runTests() {
    const fbm = new FacilityBookingModule(facilities);

    assertEquals(
        fbm.bookFacility("Clubhouse", "2020-10-26", "16:00", "22:00"),
        "Booked, Rs. 3000",
        "Clubhouse booking success"
    );

    assertEquals(
        fbm.bookFacility("Tennis Court", "2020-10-26", "16:00", "20:00"),
        "Booked, Rs. 200",
        "Tennis Court booking success"
    );

    assertEquals(
        fbm.bookFacility("Clubhouse", "2020-10-26", "16:00", "22:00"),
        "Booking Failed, Already Booked",
        "Clubhouse booking conflict"
    );

    assertEquals(
        fbm.bookFacility("Tennis Court", "2020-10-26", "17:00", "21:00"),
        "Booking Failed, Already Booked",
        "Tennis Court booking conflict"
    );
}

// Run the tests
runTests();
