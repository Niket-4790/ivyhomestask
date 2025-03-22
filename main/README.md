
# Autocomplete API Extraction Results

## Statistics
- **Total API Requests:** 49
- **Successful Requests:** 49
- **Failed Requests:** 0
- **Rate Limit Hits:** 0
- **Total Names Found:** 10

## API Endpoint
- Base URL: http://35.200.185.69:8000
- Versions explored: v1

## Approach
- Used a breadth-first search algorithm to explore autocomplete results
- Implemented rate limiting protection with exponential backoff
- Extracted next character possibilities from results to minimize requests
- Saved all unique names to JSON files

## Files
- v1_names.json: Contains 10 names from v1
