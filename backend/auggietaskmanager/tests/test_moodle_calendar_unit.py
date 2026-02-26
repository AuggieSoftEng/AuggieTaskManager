# This file contains unit tests for the extract_calendar_data function in moodle.utils.

from datetime import datetime
from unittest import TestCase
from unittest.mock import patch, MagicMock

import pytz
import requests
from icalendar import Calendar, Event

from moodle.utils import extract_calendar_data


class TestExtractCalendarData(TestCase):
    """
    Test suite for extract_calendar_data function

    Args:
        TestCase: unittest.TestCase class for structuring test cases
    """

    def setUp(self):
        """
        Set up test fixtures
        """
        self.calendar_url = "https://moodle.example.com/calendar.ics"
        self.central_tz = pytz.timezone("America/Chicago")

    # ==================== HAPPY PATHS ====================

    @patch("moodle.utils.requests.get")
    def test_single_event(self, mock_get):
        """
        Test extraction of a calendar with a single event

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with one event
        cal = Calendar()
        cal.add("prodid", "-//Test//Test//EN")
        cal.add("version", "2.0")

        # WHEN: we add an event to the calendar
        event = Event()
        event.add("summary", "Assignment 1")
        event.add("description", "Complete assignment 1")
        event.add("categories", "CS101")
        end_time = self.central_tz.localize(datetime(2026, 3, 15, 23, 59, 59))
        event.add("dtend", end_time)

        cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect to get the correct event data
        result = extract_calendar_data(self.calendar_url)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["title"], "Assignment 1")
        self.assertEqual(result[0]["description"], "Complete assignment 1")
        self.assertIn("CS101", result[0]["course"])
        self.assertIn("2026-03-15T23:59:59", result[0]["due_date"])

    @patch("moodle.utils.requests.get")
    def test_multiple_events(self, mock_get):
        """
        Test extraction of a calendar with multiple events

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with multiple events
        cal = Calendar()
        cal.add("prodid", "-//Test//Test//EN")
        cal.add("version", "2.0")

        # WHEN: we add multiple events to the calendar
        event1 = Event()
        event1.add("summary", "Assignment 1")
        event1.add("description", "First assignment")
        event1.add("categories", "CS101")
        end_time1 = datetime(2026, 3, 10, 12, 0, 0, tzinfo=self.central_tz)
        event1.add("dtend", end_time1)
        cal.add_component(event1)

        event2 = Event()
        event2.add("summary", "Quiz 2")
        event2.add("description", "Second quiz")
        event2.add("categories", "MATH102")
        end_time2 = datetime(2026, 3, 20, 14, 30, 0, tzinfo=self.central_tz)
        event2.add("dtend", end_time2)
        cal.add_component(event2)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect to get both events correctly
        result = extract_calendar_data(self.calendar_url)
        self.assertEqual(len(result), 2)
        titles = [item["title"] for item in result]
        self.assertCountEqual(titles, ["Assignment 1", "Quiz 2"])

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_timezone_conversion(self, mock_get):
        """
        Test that dates are correctly converted to Central Time

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with an event in UTC time
        cal = Calendar()
        cal.add("prodid", "-//Test//Test//EN")
        cal.add("version", "2.0")

        # WHEN: we add an event with dtend in UTC
        event = Event()
        event.add("summary", "Test Event")
        event.add("description", "Test")
        event.add("categories", "TEST101")
        utc_tz = pytz.UTC
        end_time = datetime(2026, 3, 15, 5, 0, 0, tzinfo=utc_tz)
        event.add("dtend", end_time)
        cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect the due date to be converted to Central Time
        result = extract_calendar_data(self.calendar_url)
        self.assertEqual(len(result), 1)
        due_date_str = result[0]["due_date"]
        self.assertIn("2026-03-15T00:00:00", due_date_str)

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_course_name_truncation(self, mock_get):
        """
        Test that course names are truncated to 15 characters

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with an event that has a very long course name
        cal = Calendar()
        cal.add("prodid", "-//Test//Test//EN")
        cal.add("version", "2.0")

        # WHEN: we add an event with a long course name
        event = Event()
        event.add("summary", "Long Course Event")
        event.add("description", "Test")
        event.add("categories", "VERYLONGCOURSECODETHATSHOULDBECUTOFF")
        end_time = datetime(2026, 3, 15, 12, 0, 0, tzinfo=self.central_tz)
        event.add("dtend", end_time)
        cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect the course name to be truncated to 15 characters
        result = extract_calendar_data(self.calendar_url)
        self.assertEqual(len(result), 1)
        self.assertLessEqual(len(result[0]["course"]), 15)

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_empty_calendar(self, mock_get):
        """
        Test extraction of an empty calendar

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: an empty calendar with no events
        cal = Calendar()

        # WHEN: we mock the requests.get to return this empty calendar
        cal.add("prodid", "-//Test//Test//EN")
        cal.add("version", "2.0")

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect to get an empty list
        result = extract_calendar_data(self.calendar_url)
        self.assertEqual(len(result), 0)
        self.assertIsInstance(result, list)

    # ==================== SAD PATHS ====================

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_network_error(self, mock_get):
        """
        Test handling of network error (ConnectionError)

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a network error occurs when trying to fetch the calendar
        mock_get.side_effect = requests.exceptions.ConnectionError(
            "Failed to connect"
        )

        # WHEN/THEN: we call extract_calendar_data and expect it to raise a ConnectionError
        with self.assertRaises(requests.exceptions.ConnectionError):
            extract_calendar_data(self.calendar_url)

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_non_ical_http_response(self, mock_get):
        """
        Test handling of a non-iCalendar HTTP response body (e.g., a 404 page)

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: the server returns a response whose body is not valid iCalendar data
        mock_response = MagicMock()
        mock_response.content = b"Not Found"
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect it to raise an Exception
        with self.assertRaises(Exception):
            extract_calendar_data(self.calendar_url)

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_invalid_ical_format(self, mock_get):
        """
        Test handling of invalid iCalendar format

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a response with invalid iCalendar data
        mock_response = MagicMock()
        mock_response.content = b"This is not valid iCalendar data"

        # WHEN: we mock the requests.get to return this invalid calendar data
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect it to raise an Exception
        with self.assertRaises(Exception):
            extract_calendar_data(self.calendar_url)

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_missing_summary(self, mock_get):
        """
        Test handling of event with missing summary

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with an event that has no summary field
        cal = Calendar()
        cal.add("prodid", "-//Test//Test//EN")
        cal.add("version", "2.0")

        # WHEN: we add an event without a summary field
        event = Event()
        # Missing summary field
        event.add("description", "Test")
        event.add("categories", "CS101")
        end_time = datetime(2026, 3, 15, 12, 0, 0, tzinfo=self.central_tz)
        event.add("dtend", end_time)
        cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect it to handle gracefully with title "None"
        result = extract_calendar_data(self.calendar_url)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["title"], "None")

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_missing_description(self, mock_get):
        """
        Test handling of event with missing description

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with an event that has no description field
        cal = Calendar()
        cal.add("prodid", "-//Test//Test//EN")
        cal.add("version", "2.0")

        # WHEN: we add an event without a description field
        event = Event()
        event.add("summary", "Test Event")
        # Missing description field
        event.add("categories", "CS101")
        end_time = datetime(2026, 3, 15, 12, 0, 0, tzinfo=self.central_tz)
        event.add("dtend", end_time)
        cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect it to handle gracefully with description "None"
        result = extract_calendar_data(self.calendar_url)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["description"], "None")

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_missing_dtend(self, mock_get):
        """
        Test handling of event with missing dtend (due date)

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with an event that has no dtend field
        cal = Calendar()
        cal.add("prodid", "-//Test//Test//EN")
        cal.add("version", "2.0")

        # WHEN: we add an event without a dtend field
        event = Event()
        event.add("summary", "Test Event")
        event.add("description", "Test")
        event.add("categories", "CS101")
        # Missing dtend field
        cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect it to raise AttributeError
        with self.assertRaises(AttributeError):
            extract_calendar_data(self.calendar_url)

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_missing_categories(self, mock_get):
        """
        Test handling of event with missing categories

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with an event that has no categories field
        cal = Calendar()
        cal.add("prodid", "-//Test//Test//EN")
        cal.add("version", "2.0")

        # WHEN: we add an event without a categories field
        event = Event()
        event.add("summary", "Test Event")
        event.add("description", "Test")
        # Missing categories field
        end_time = datetime(2026, 3, 15, 12, 0, 0, tzinfo=self.central_tz)
        event.add("dtend", end_time)
        cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect it to raise AttributeError
        with self.assertRaises(AttributeError):
            extract_calendar_data(self.calendar_url)

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_timeout_error(self, mock_get):
        """
        Test handling of request timeout

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a request timeout occurs when trying to fetch the calendar
        mock_get.side_effect = requests.exceptions.Timeout("Request timed out")

        # WHEN/THEN: we call extract_calendar_data and expect it to raise a Timeout exception
        with self.assertRaises(requests.exceptions.Timeout):
            extract_calendar_data(self.calendar_url)

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_empty_response(self, mock_get):
        """
        Test handling of empty response content

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a response with empty content
        mock_response = MagicMock()
        mock_response.content = b""

        # WHEN: we mock the requests.get to return this empty response
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect it to raise an Exception
        with self.assertRaises(Exception):
            extract_calendar_data(self.calendar_url)

    @patch("moodle.utils.requests.get")
    def test_extract_calendar_data_malformed_event_data(self, mock_get):
        """
        Test handling of malformed event data within valid calendar

        Args:
            mock_get (MagicMock): Mocked requests.get function
        """
        # GIVEN: a calendar with an event that has malformed dtend data
        cal = Calendar()
        cal.add("prodid", "-//Test//Test//EN")
        cal.add("version", "2.0")

        # WHEN: we add an event with invalid dtend (not a proper datetime)
        event = Event()
        event.add("summary", "Test Event")
        event.add("description", "Test")
        event.add("categories", "CS101")
        event["dtend"] = "invalid-datetime"
        cal.add_component(event)

        # AND: we mock the requests.get to return this calendar
        mock_response = MagicMock()
        mock_response.content = cal.to_ical()
        mock_get.return_value = mock_response

        # THEN: we call extract_calendar_data and expect it to raise an Exception
        with self.assertRaises(Exception):
            extract_calendar_data(self.calendar_url)