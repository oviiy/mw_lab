"""Minimal JSON schemas for the files the front end reads (shape checks, not business rules)."""
NUM = {"type": ["number", "null"]}
NUMS = {"type": "array", "items": NUM}
STR_ARR = {"type": "array", "items": {"type": "string"}}

META = {"type": "object", "required": ["generated_at", "latest_period", "periods", "managers", "stocks", "coverage", "universe"],
        "properties": {"periods": STR_ARR,
                       "managers": {"type": "array", "items": {"type": "object", "required": ["cik", "name", "person", "style", "value", "n"]}},
                       "stocks": {"type": "array", "items": {"type": "object", "required": ["t", "n", "s"]}}}}
HOME = {"type": "object", "required": ["period", "most_bought", "most_sold", "crowded", "sector_flows"],
        "properties": {"sector_flows": {"type": "object", "required": ["buys", "sells"]}}}
MANAGER = {"type": "object",
           "required": ["cik", "name", "person", "style", "bio", "sources", "periods", "series", "sectors", "latest",
                        "changes", "race", "options", "backtest", "similar"],
           "properties": {"series": {"type": "object", "required": ["value", "n", "top10", "hhi", "turnover", "hold_q"],
                                     "additionalProperties": NUMS},
                          "backtest": {"type": ["object", "null"]}}}
STOCK = {"type": "object", "required": ["t", "n", "cusip", "s", "is_etf", "price", "holders", "flows", "curated", "crowding"],
         "properties": {"holders": {"type": "object", "required": ["periods", "count", "pct", "value"]}}}
FLOWS = {"type": "object", "required": ["periods", "managers", "stocks", "rows"],
         "properties": {"rows": {"type": "array", "items": {"type": "array", "minItems": 5, "maxItems": 5}}}}
